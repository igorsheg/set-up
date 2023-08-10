use std::sync::Arc;

use crate::{
    application::services::game::GameSessionService,
    domain::game::{GameSession, Hand, Player, Stock},
    infra::error::Error,
};
use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Path,
    },
    response::IntoResponse,
    Extension,
};

use futures::{
    sink::SinkExt,
    stream::{SplitSink, StreamExt},
};

use serde::{Deserialize, Serialize};
use tokio::sync::Mutex;

#[derive(Serialize, Deserialize, Debug)]
enum WebSocketMessage {
    JoinSession { code: String, username: String },
    StartMatch,
}

pub async fn handler(
    ws: WebSocketUpgrade,
    Extension(state): Extension<Arc<Mutex<GameSessionService>>>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| async move {
        if let Err(err) = websocket(socket, state).await {
            log::error!("An error occurred in the websocket handler: {}", err);
        }
    })
}

async fn websocket(stream: WebSocket, state: Arc<Mutex<GameSessionService>>) -> Result<(), Error> {
    let (sender, receiver) = stream.split();

    tokio::spawn(handle_messages(receiver, sender, state));
    Ok(())
}

async fn handle_messages(
    mut receiver: futures::stream::SplitStream<WebSocket>,
    mut sender: SplitSink<WebSocket, Message>,
    state: Arc<Mutex<GameSessionService>>,
) -> Result<(), Error> {
    while let Some(result) = receiver.next().await {
        match result {
            Ok(Message::Text(msg)) => {
                log::debug!("Message received: {}", msg);
                let ws_msg: WebSocketMessage = serde_json::from_str(&msg)?;

                match ws_msg {
                    WebSocketMessage::JoinSession { code, username } => {
                        let player = Player {
                            id: 1,
                            username: username.clone(),
                            score: 0,
                        };
                        match state.lock().await.join_session(&code, &player) {
                            Ok(session) => {
                                // log::debug!(
                                //     "From hey: {:?}",
                                //     state.lock().await.get_players(&code)
                                // );
                                let response = serde_json::json!(session.hand.cards());
                                sender.send(Message::Text(response.to_string())).await?
                            }
                            Err(err) => {
                                log::error!("Failed to join session: {}", err);
                                sender
                                    .send(Message::Text(format!("Failed to join: {}", err)))
                                    .await?
                            }
                        }
                        log::debug!(
                            "Current Session players: {:?}",
                            state.lock().await.get_players(&code)
                        )
                        // Handle join session logic here
                    }
                    WebSocketMessage::StartMatch => {
                        // Handle start match logic here
                    }
                }
                // sender
                //     .send(Message::Text(format!("Hello from {}", msg)))
                //     .await?;
            }
            Ok(Message::Close(_)) => {
                log::debug!("Received close message");
                break;
            }
            Ok(Message::Ping(ping)) => {
                log::debug!("Received ping: {:?}", ping);
                sender.send(Message::Pong(ping)).await?
            }
            Ok(_) => log::debug!("Received other message type"),
            Err(error) => {
                log::error!("Failed to receive a message: {}", error);
                return Err(Error::WebsocketError(error.to_string()));
            }
        };
    }

    Ok(())
}
