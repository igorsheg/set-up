use std::{collections::HashSet, sync::Arc};

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
use axum_extra::extract::{cookie::Cookie, CookieJar};
use futures::{sink::SinkExt, stream::StreamExt};
use hyper::StatusCode;
use tokio::sync::{mpsc, Mutex};
use uuid::Uuid;

pub async fn init_client(jar: CookieJar) -> Result<(CookieJar, String), StatusCode> {
    let mut new_jar = jar.clone();
    if new_jar.get("client_id").is_none() {
        let new_id = Uuid::new_v4().to_string();
        let mut cookie = Cookie::new("client_id", new_id);
        cookie.set_path("/");
        new_jar = new_jar.add(cookie);
    }

    Ok((new_jar, "Please connect to the WebSocket at /ws".into()))
}

#[axum::debug_handler]
pub async fn ws_handler(
    ws: WebSocketUpgrade,
    Extension(context): Extension<Arc<Mutex<Context>>>,
    jar: CookieJar,
) -> impl IntoResponse {
    let cookie = jar.get("client_id");
    let client_id = Uuid::parse_str(cookie.unwrap().value()).unwrap_or_else(|_| Uuid::new_v4());
    log::debug!("Client ID -------------> {:?}", client_id);

    ws.on_upgrade(move |socket| async move {
        if let Err(err) = handle_connection(socket, context, client_id).await {
            log::error!("An error occurred in the websocket handler: {}", err);
        }
    })
}

pub async fn handle_connection(
    ws: WebSocket,
    context: Arc<Mutex<Context>>,
    client_id: Uuid,
) -> Result<(), Error> {
    let (tx, rx) = mpsc::channel(32);

    {
        let mut ctx = context.lock().await;
        if let Some(_old_client) = ctx.clients.get(&client_id) {
            ctx.clients.remove(&client_id);
        }
        ctx.clients
            .insert(client_id, Client::new(tx.clone(), client_id));
    }

    let (mut ws_tx, ws_rx) = ws.split();
    let context_clone = context.clone();

    let reader_task = tokio::spawn(async move {
        let mut ws_rx = ws_rx;
        while let Some(Ok(msg)) = ws_rx.next().await {
            if let Ok(text) = msg.to_text() {
                let message: Result<WsMessage, _> = serde_json::from_str(text);
                match message {
                    Ok(message) => match MessageType::from_ws_message(message.clone()) {
                        Ok(message_type) => {
                            let mut ctx = context.lock().await;
                            if let Err(err) = ctx.handle_message(message_type, client_id).await {
                                log::error!(
                                    "Error handling message: {}. Original message: {:?}",
                                    err,
                                    message
                                );
                            }
                        }
                        Err(e) => {
                            log::error!(
                                "Failed to convert to MessageType: {}. Original message: {:?}",
                                e,
                                message
                            );
                        }
                    },
                    Err(e) => {
                        log::error!(
                            "Failed to parse WebSocket message: {}. Original text: {}",
                            e,
                            text
                        );
                    }
                }
            }
        }

        let mut ctx = context.lock().await;
        ctx.handle_leave(client_id)
            .await
            .expect("Failed to handle client leave");
    });

    let writer_task = tokio::spawn(async move {
        let mut rx = rx;
        while let Some(message) = rx.recv().await {
            log::debug!("Preparing to send game message to WebSocket...");
            let json_message = serde_json::to_string(&message).unwrap();
            if let Err(err) = ws_tx.send(Message::Text(json_message)).await {
                log::error!("Failed to send game message to WebSocket. Error: {:?}", err);
            }
        }
    });

    // Wait for both tasks to complete
    let join_result = tokio::try_join!(reader_task, writer_task);
    if let Err(err) = join_result {
        log::error!(
            "An error occurred while processing the WebSocket tasks: {:?}",
            err
        );
        return Err(Error::WebsocketError(
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
    pub tx: mpsc::Sender<Game>,
    pub room_code: Option<String>,
}

impl Client {
    pub fn new(tx: mpsc::Sender<Game>, id: Uuid) -> Self {
        Self {
            id,
            tx,
            room_code: None,
        }
    }

    pub async fn send_message(&self, message: Game) -> Result<(), Error> {
        self.tx.send(message).await.map_err(|err| {
            Error::WebsocketError(format!("Failed to send message to client: {:?}", err))
        })
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

pub async fn get_past_rooms(
    Extension(context): Extension<Arc<Mutex<Context>>>,
    jar: CookieJar,
) -> impl IntoResponse {
    let cookie = jar.get("client_id");
    let client_id = Uuid::parse_str(cookie.unwrap().value()).unwrap_or_else(|_| Uuid::new_v4());

    log::debug!("Client ID: {:?}", client_id);

    let ctx = context.lock().await;
    if let Some(client_data) = ctx.clients_data.get(&client_id) {
        log::debug!("Client: {:?}", client_data);
        return Json(client_data.rooms_joined.clone());
    }
    Json(HashSet::new())
}
