use std::sync::Arc;

use crate::{
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
    Extension, Json,
};
use futures::{sink::SinkExt, stream::StreamExt};
use tokio::sync::{mpsc, Mutex};
use uuid::Uuid;

#[axum::debug_handler]
pub async fn ws_handler(
    ws: WebSocketUpgrade,
    Extension(context): Extension<Arc<Mutex<Context>>>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| async move {
        if let Err(err) = handle_connection(socket, context).await {
            log::error!("An error occurred in the websocket handler: {}", err);
        }
    })
}

pub async fn handle_connection(ws: WebSocket, context: Arc<Mutex<Context>>) -> Result<(), Error> {
    let (tx, rx) = mpsc::channel(32);
    let client = Client::new(context.clone(), tx);
    let client_id = client.id;

    // Register the client with the context
    {
        let mut ctx = context.lock().await;
        ctx.clients.insert(client_id, client);
    }

    // Spawn separate tasks for reading and writing to better control each direction of the communication
    let (mut ws_tx, ws_rx) = ws.split();
    let context_clone = context.clone(); // Clone the Arc

    // Reader task
    let reader_task = tokio::spawn(async move {
        let mut ws_rx = ws_rx;
        while let Some(Ok(msg)) = ws_rx.next().await {
            if let Ok(text) = msg.to_text() {
                let message: Result<WsMessage, _> = serde_json::from_str(text);
                if let Ok(message) = message {
                    let message_type = MessageType::from_ws_message(message).unwrap();
                    let mut ctx = context.lock().await;
                    if let Err(err) = ctx.handle_message(message_type, client_id).await {
                        log::error!("Error handling message: {}", err);
                    }
                } else {
                    log::error!("Failed to parse WebSocket message");
                }
            }
        }
    });

    let writer_task = tokio::spawn(async move {
        let mut rx = rx;
        while let Some(message) = rx.recv().await {
            let json_message = serde_json::to_string(&message).unwrap();
            ws_tx.send(Message::Text(json_message)).await.unwrap();
        }
    });

    // Wait for both tasks to complete
    let join_result = tokio::try_join!(reader_task, writer_task);
    if let Err(err) = join_result {
        log::error!(
            "An error occurred while processing the WebSocket tasks: {:?}",
            err
        );
        return Err(Error::GameError(
            "An error occurred while processing the WebSocket tasks".to_string(),
        ));
    }
    // Unregister the client from the context
    {
        let mut ctx = context_clone.lock().await;
        ctx.clients.remove(&client_id);
    }

    Ok(())
}

#[derive(Debug)]
pub struct Client {
    pub id: Uuid,
    pub context: Arc<Mutex<Context>>,
    pub tx: mpsc::Sender<Game>,
}

impl Client {
    pub fn new(context: Arc<Mutex<Context>>, tx: mpsc::Sender<Game>) -> Self {
        Self {
            id: Uuid::new_v4(),
            context,
            tx,
        }
    }

    pub async fn send_message(&self, message: Game) -> Result<(), Error> {
        self.tx
            .send(message)
            .await
            .map_err(|_| Error::WebsocketError("Failed to send message to client".to_string()))
    }
}

pub async fn new_room_handler(
    Extension(context): Extension<Arc<Mutex<Context>>>,
) -> impl IntoResponse {
    let mut ctx = context.lock().await;
    let room_code = nanoid::nanoid!(6);
    let game = Game::new();
    ctx.rooms.insert(room_code.clone(), game);
    log::debug!("Created new game with room code {}", room_code);
    Json(room_code)
}
