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

use crate::{
    domain::{
        events::{AppEvent, Command, Event, Topic},
        game::game::Game,
        message::{MessageType, WsMessage},
    },
    infra::{error::Error, event_emmiter::EventEmitter},
};

#[axum::debug_handler]
pub async fn ws_handler(
    ws: WebSocketUpgrade,
    Extension(event_emitter): Extension<EventEmitter>,
    jar: CookieJar,
) -> impl IntoResponse {
    let client_id = get_client_id_from_cookies(&jar);

    ws.on_upgrade(move |socket| async move {
        if let Err(err) = handle_connection(socket, event_emitter, client_id).await {
            tracing::error!("WebSocket handler encountered an error: {}", err);
        }
    })
}

fn get_client_id_from_cookies(jar: &CookieJar) -> u16 {
    jar.get("client_id")
        .and_then(|cookie| cookie.value().parse::<u16>().ok())
        .unwrap_or_else(rand::random)
}

async fn handle_connection(
    ws: WebSocket,
    event_emitter: EventEmitter,
    client_id: u16,
) -> Result<(), Error> {
    let (ws_tx, ws_rx) = ws.split();

    let (_tx, rx) = setup_client(&event_emitter, client_id).await?;
    let reader_task = read_from_ws(ws_rx, event_emitter, client_id);
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
    event_emitter: &EventEmitter,
    client_id: u16,
) -> Result<(mpsc::Sender<Game>, mpsc::Receiver<Game>), Error> {
    let (tx, rx) = mpsc::channel(32);

    event_emitter
        .emit_command(
            Topic::ClientService,
            Command::SetupClient(client_id, tx.clone()),
        )
        .await?;

    Ok((tx, rx))
}

async fn read_from_ws(
    mut ws_rx: impl StreamExt<Item = Result<Message, axum::Error>> + Unpin,
    event_emitter: EventEmitter,
    client_id: u16,
) -> Result<(), Error> {
    while let Some(result) = ws_rx.next().await {
        match result {
            Ok(msg) => handle_incoming_message(event_emitter.clone(), msg, client_id).await?,
            Err(e) => handle_incoming_error(e)?,
        }
    }

    event_emitter
        .emit_app_event(
            Topic::ClientService,
            AppEvent::EventOccurred(Event::ClientDisconnected(client_id)),
        )
        .await?;

    Ok(())
}

async fn handle_incoming_message(
    event_emitter: EventEmitter,
    msg: Message,
    client_id: u16,
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

    match message_type {
        MessageType::Join(message) => {
            event_emitter
                .emit_command(
                    Topic::RoomService,
                    Command::RequestPlayerJoin(client_id, message),
                )
                .await?;
            Ok(())
        }
        MessageType::Move(message) => {
            event_emitter
                .emit_command(Topic::RoomService, Command::PlayerMove(client_id, message))
                .await?;
            Ok(())
        }
        MessageType::Request(message) => {
            event_emitter
                .emit_command(
                    Topic::RoomService,
                    Command::RequestCards(client_id, message),
                )
                .await?;
            Ok(())
        }
        _ => {
            tracing::warn!("Message type not handled: {:?}", message_type);
            Err(Error::WebsocketError(
                "Message type not handled".to_string(),
            ))
        }
    }
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
