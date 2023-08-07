use std::sync::Arc;

use crate::application::services::game::GameSessionService;
use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    response::IntoResponse,
    Extension,
};

use futures::{
    sink::SinkExt,
    stream::{SplitSink, SplitStream, StreamExt},
};

use serde::{Deserialize, Serialize};
use tokio::sync::Mutex;

#[derive(Serialize, Deserialize)]
enum WebSocketMessage {
    // CreateSession,
    JoinSession { code: String },
    StartMatch,
}

pub struct Client {
    session_id: String,
}

// pub struct AppState {
//     game_session_service: Arc<RwLock<GameSessionService>>,
// }
//
// impl AppState {
//     pub fn new(game_session_service: GameSessionService) -> Self {
//         Self {
//             game_session_service: Arc::new(RwLock::new(game_session_service)),
//         }
//     }
// }

pub async fn handler(
    ws: WebSocketUpgrade,
    Extension(state): Extension<Arc<Mutex<GameSessionService>>>,
) -> impl IntoResponse {
    // ... (rest of the code)
    ws.on_upgrade(|socket| websocket(socket, state))
}

// async fn websocket_handler(
//     stream: WebSocket,
//     state: Arc<GameSessionService>,
//     session_code: String,
// ) -> Result<(), Box<dyn std::error::Error>> {
//     let (mut sender, mut receiver) = stream.split();
//     while let Some(Message::Text(msg)) = receiver.next().await.transpose()? {
//         let msg: WebSocketMessage = serde_json::from_str(&msg)?;
//         match msg {
//             WebSocketMessage::StartMatch => {
//                 let code = state.game_session_service.lock().unwrap().create_session();
//                 sender.send(Message::Text(code)).await?;
//             }
//             WebSocketMessage::JoinSession { code } => {
//                 // Handle joining session logic here...
//                 // You can create a Player object and call the join_session method.
//             } // Handle other game-related actions...
//         }
//     }
//     Ok(())
// }

async fn websocket(stream: WebSocket, state: Arc<Mutex<GameSessionService>>) {
    // let session_id = SessionId::from(client_session_id);
    let (mut sender, receiver) = stream.split();

    let session_code = state.lock().await.create_session(); // Lock the GameSessionService
    log::debug!("Session Code: {}", session_code);

    // state
    //     .clients
    //     .lock()
    //     .await
    //     .insert(session_id.to_string(), Client::new(session_id.clone()));
    //
    // let messages = state.clone().chat_service.list(&session_id).await.unwrap();
    // let text = serde_json::to_string(&messages).unwrap();
    // sender.send(Message::Text(text)).await.unwrap();

    tokio::spawn(handle_messages(
        receiver,
        state.clone(),
        sender,
        session_code,
    ));
}

async fn handle_messages(
    mut receiver: SplitStream<WebSocket>,
    state: Arc<Mutex<GameSessionService>>,
    mut sender: SplitSink<WebSocket, Message>,
    session_code: String,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    // while let Some(Message::Text(msg)) = receiver.next().await.transpose()? {
    //     let msg: WebSocketMessage = serde_json::from_str(&msg)?;
    //     match msg {
    //         WebSocketMessage::StartMatch => {
    //             sender.send(Message::Text(session_code.clone())).await?;
    //         }
    //         WebSocketMessage::JoinSession { code } => {
    //             // Handle joining session logic here...
    //             // You can create a Player object and call the join_session method.
    //         } // Handle other game-related actions...
    //     }
    // }

    while let Some(result) = receiver.next().await {
        log::debug!("Received something: {:?}", result);
        match result {
            Ok(Message::Text(msg)) => {
                log::debug!("Message received: {}", msg);
                let json_msg = serde_json::to_string(&msg).unwrap();

                // Send the message to the client
                sender.send(Message::Text(json_msg)).await.unwrap();
                // sender.send(Message::Text(session_code.clone())).await?;

                // let parsed_msg: ChatMessage = match serde_json::from_str(&msg) {
                //     Ok(parsed) => parsed,
                //     Err(e) => {
                //         log::error!("Failed to parse message: {}", e);
                //         continue;
                //     }
                // };
                //
                // message_service
                //     .handle_message(&session_id, &mut sender, parsed_msg)
                //     .await?;
            }
            Ok(Message::Close(_)) => {
                log::debug!("Received close message");
                break;
            }
            Ok(Message::Ping(ping)) => {
                log::debug!("Received ping: {:?}", ping);
                sender.send(Message::Pong(ping)).await?;
            }
            Ok(Message::Pong(_)) => {
                log::debug!("Received pong");
            }
            Ok(_) => {
                log::debug!("Received other message type");
            }
            Err(error) => {
                log::error!("Failed to receive a message: {}", error);
                continue;
            }
        };
    }

    Ok(())
}
