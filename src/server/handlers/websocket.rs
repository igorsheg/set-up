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
    tracing::info!("Incoming WebSocket connection");

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
        Err(err) => {
            tracing::error!("WebSocket tasks encountered an error: {:?}", err);
            Err(Error::WebsocketError(
                "An error occurred while processing the WebSocket tasks".to_string(),
            ))
        }
        _ => Ok(()),
    }
}

async fn setup_client(
    context: Arc<Context>,
    client_id: Uuid,
) -> Result<(mpsc::Sender<Game>, mpsc::Receiver<Game>), Error> {
    let (tx, rx) = mpsc::channel(32);
    let mut client_manager = context.client_manager().lock().await;
    if client_manager.find_client(client_id).is_ok() {
        client_manager.remove_client(client_id);
    }
    client_manager.add_client(client_id, Client::new(tx.clone(), client_id));
    Ok((tx, rx))
}

async fn read_from_ws(
    mut ws_rx: impl StreamExt<Item = Result<Message, axum::Error>> + Unpin,
    context: Arc<Context>,
    client_id: Uuid,
) -> Result<(), Error> {
    while let Some(result) = ws_rx.next().await {
        match result {
            Ok(msg) => {
                if let Ok(text) = msg.to_text() {
                    let message: Result<WsMessage, _> = serde_json::from_str(text);
                    match message {
                        Ok(message) => match MessageType::from_ws_message(message.clone()) {
                            Ok(message_type) => {
                                if let Err(err) =
                                    context.handle_message(message_type, client_id).await
                                {
                                    tracing::error!(error = %err, message = ?message, "Error handling WebSocket message");
                                }
                            }
                            Err(e) => {
                                tracing::error!(error = %e, message = ?message, "Failed to convert to MessageType");
                            }
                        },
                        Err(e) => {
                            tracing::error!(error = %e, "Failed to parse WebSocket message");
                        }
                    }
                }
            }
            Err(e) => {
                tracing::error!(error = %e, "Error receiving WebSocket message");
            }
        }
    }

    let mut room_manager = context.room_manager().lock().await;
    let mut client_manager = context.client_manager().lock().await;
    room_manager
        .handle_leave(client_id, &mut client_manager)
        .await?;

    Ok(())
}

async fn write_to_ws(
    mut rx: mpsc::Receiver<Game>,
    mut ws_tx: impl futures::Sink<Message> + Unpin,
) -> Result<(), Error> {
    while let Some(message) = rx.recv().await {
        let json_message = serde_json::to_string(&message).unwrap();
        let ws_message = Message::Text(json_message);
        if ws_tx.send(ws_message).await.is_err() {
            tracing::error!("Failed to send game message to WebSocket");
        }
    }
    Ok(())
}
