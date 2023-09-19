use std::sync::Arc;

use crate::{
    client::Client,
    context::Context,
    game::game::Game,
    infra::error::Error,
    message::{MessageType, WsMessage},
};
use axum::{
    extract::{
        ws::{Message, WebSocket},
        WebSocketUpgrade,
    },
    response::IntoResponse,
    Extension,
};
use axum_extra::extract::CookieJar;
use futures::{sink::SinkExt, stream::StreamExt};
use tokio::sync::mpsc;
use uuid::Uuid;

#[axum::debug_handler]
pub async fn ws_handler(
    ws: WebSocketUpgrade,
    Extension(context): Extension<Arc<Context>>,
    jar: CookieJar,
) -> impl IntoResponse {
    let client_id = get_client_id_from_cookies(&jar);

    ws.on_upgrade(move |socket| async move {
        if let Err(err) = handle_connection(socket, context, client_id).await {
            tracing::error!("WebSocket handler encountered an error: {}", err);
        }
    })
}

fn get_client_id_from_cookies(jar: &CookieJar) -> Uuid {
    jar.get("client_id")
        .and_then(|cookie| Uuid::parse_str(cookie.value()).ok())
        .unwrap_or_else(Uuid::new_v4)
}

async fn handle_connection(
    ws: WebSocket,
    context: Arc<Context>,
    client_id: Uuid,
) -> Result<(), Error> {
    let (ws_tx, ws_rx) = ws.split();

    let (_tx, rx) = setup_client(context.clone(), client_id).await?;
    let reader_task = read_from_ws(ws_rx, context.clone(), client_id);
    let writer_task = write_to_ws(rx, ws_tx);

    match tokio::try_join!(reader_task, writer_task) {
        Ok(_) => {
            tracing::info!("Client {} disconnected gracefully", client_id);
            Ok(())
        }
        Err(err) => Err(err),
    }
}

async fn setup_client(
    context: Arc<Context>,
    client_id: Uuid,
) -> Result<(mpsc::Sender<Game>, mpsc::Receiver<Game>), Error> {
    let (tx, rx) = mpsc::channel(32);
    let client_manager = context.client_manager();
    if client_manager.find_client(client_id).await.is_ok() {
        client_manager.remove_client(client_id).await;
    }
    client_manager
        .add_client(client_id, Client::new(tx.clone(), client_id))
        .await;
    Ok((tx, rx))
}

async fn read_from_ws(
    mut ws_rx: impl StreamExt<Item = Result<Message, axum::Error>> + Unpin,
    context: Arc<Context>,
    client_id: Uuid,
) -> Result<(), Error> {
    while let Some(result) = ws_rx.next().await {
        match result {
            Ok(msg) => handle_incoming_message(msg, context.clone(), client_id).await?,
            Err(e) => handle_incoming_error(e)?,
        }
    }

    tracing::info!("WebSocket connection closed for client: {}", client_id);
    cleanup_client(context, client_id).await?;

    Ok(())
}

async fn handle_incoming_message(
    msg: Message,
    context: Arc<Context>,
    client_id: Uuid,
) -> Result<(), Error> {
    let text = msg.to_text().map_err(|e| {
        tracing::error!(error = %e, "Failed to convert message to text");
        Error::JsonError(e.to_string())
    })?;

    if text.trim().is_empty() {
        tracing::info!("Received empty message, skipping.");
        return Ok(());
    }

    let message: WsMessage = serde_json::from_str(text).map_err(|e| {
        tracing::error!(error = %e, "Failed to parse WebSocket message");
        Error::WebsocketError(e.to_string())
    })?;

    let message_type = MessageType::from_ws_message(message.clone()).map_err(|e| {
        tracing::error!(error = %e, message = ?message, "Failed to convert to MessageType");
        Error::WebsocketError(e.to_string())
    })?;

    let client_manager = context.client_manager();
    let room_manager = context.room_manager();

    context
        .handle_message(message_type, client_id, room_manager, client_manager)
        .await?;

    Ok(())
}

fn handle_incoming_error(err: axum::Error) -> Result<(), Error> {
    tracing::error!(error = %err, "Error receiving WebSocket message");

    if err
        .to_string()
        .contains("Connection reset without closing handshake")
    {
        tracing::warn!("Client disconnected abruptly.");
        return Ok(());
    }

    Err(Error::WebsocketError(err.to_string()))
}

async fn write_to_ws(
    mut rx: mpsc::Receiver<Game>,
    mut ws_tx: impl futures::Sink<Message, Error = axum::Error> + Unpin,
) -> Result<(), Error> {
    while let Some(message) = rx.recv().await {
        let json_message = serde_json::to_string(&message).unwrap_or_else(|err| {
            tracing::error!("Failed to serialize game message: {}", err);
            String::new()
        });

        if json_message.is_empty() {
            continue;
        }

        let ws_message = Message::Text(json_message);

        match ws_tx.send(ws_message).await {
            Ok(_) => {}
            Err(err) => {
                tracing::error!("Failed to send game message to WebSocket: {}", err);
            }
        }
    }

    Ok(())
}

async fn cleanup_client(context: Arc<Context>, client_id: Uuid) -> Result<(), Error> {
    let room_manager = context.room_manager();
    let client_manager = context.client_manager();
    match room_manager.handle_leave(client_id, client_manager).await {
        Ok(_) => Ok(()),
        Err(e) if e.to_string().contains("Client not in a room") => {
            tracing::info!("Client {} was not in any room.", client_id);
            Ok(())
        }
        Err(e) => {
            tracing::error!("Error handling leave for client {}: {:?}", client_id, e);
            Err(e)
        }
    }
}
