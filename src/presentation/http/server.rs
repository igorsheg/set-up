use crate::infra::error::Error;
use axum::{
    extract::{
        ws::{Message, WebSocket},
        Path, WebSocketUpgrade,
    },
    http::Method,
    response::{Html, IntoResponse},
    routing::get,
    BoxError, Extension,
};
use futures::{
    sink::SinkExt,
    stream::{SplitSink, StreamExt},
};
use serde::Deserialize;
use std::{collections::HashMap, net::SocketAddr, sync::Arc};
use tokio::sync::{mpsc, Mutex};
use tower_http::cors::{Any, CorsLayer};

pub struct Server {
    host: String,
    port: u16,
}

impl Server {
    pub fn new(host: String, port: u16) -> Self {
        Self { host, port }
    }

    pub async fn run(&self) {
        let addr: SocketAddr = format!("{}:{}", self.host, self.port)
            .parse()
            .expect("Unable to parse address");

        let cors = CorsLayer::new()
            .allow_methods(vec![
                Method::GET,
                Method::POST,
                Method::PATCH,
                Method::PUT,
                Method::OPTIONS,
            ])
            .allow_origin(Any)
            .allow_headers(vec![
                axum::http::header::CONTENT_TYPE,
                axum::http::header::CACHE_CONTROL,
                axum::http::header::AUTHORIZATION,
            ]);

        let hub = Arc::new(Hub::new());

        let app = axum::Router::new()
            .route("/create_room", get(create_room))
            .route("/join_room/:room_code", get(join_room))
            .route("/ws/:room_code", get(upgrade_ws))
            .layer(Extension(hub))
            .layer(cors);

        println!("Listening on {}", &addr);

        axum::Server::bind(&addr)
            .serve(app.into_make_service())
            .await
            .unwrap();
    }
}

pub struct Hub {
    rooms: Mutex<HashMap<String, Room>>,
}

impl Hub {
    fn new() -> Self {
        Hub {
            rooms: Mutex::new(HashMap::new()),
        }
    }
}

pub async fn create_room(Extension(hub): Extension<Arc<Hub>>) -> impl IntoResponse {
    let room_code = nanoid::nanoid!(6);
    let room = Room::new(room_code.clone());
    hub.rooms.lock().await.insert(room_code.clone(), room);
    Html(format!("<p>Room created with code: {}</p>", room_code))
}

pub async fn join_room(
    Extension(hub): Extension<Arc<Hub>>,
    Path(room_code): Path<String>,
) -> Result<axum::Json<&'static str>, Html<String>> {
    let mut rooms = hub.rooms.lock().await;
    if let Some(room) = rooms.get_mut(&room_code) {
        room.join().await
    } else {
        Err(Html(format!(
            "<p>Room with code {} not found</p>",
            room_code
        )))
    }
}

pub async fn upgrade_ws(
    Path(room_code): Path<String>,
    ws: WebSocketUpgrade,
    Extension(hub): Extension<Arc<Hub>>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| async move {
        if let Err(err) = websocket(socket, hub, room_code).await {
            log::error!("An error occurred in the websocket handler: {}", err);
        }
    })
}

async fn websocket(stream: WebSocket, hub: Arc<Hub>, room_code: String) -> Result<(), Error> {
    let (sender, receiver) = stream.split();

    let mut rooms = hub.rooms.lock().await;
    let room = match rooms.get_mut(&room_code) {
        Some(room) => room,
        None => {
            return Err(Error::AxumError("Room not found".to_string()));
        }
    };

    if room.players.len() >= 2 {
        return Err(Error::AxumError("Room is full".to_string()));
    }

    let (tx, mut rx) = mpsc::unbounded_channel::<Result<Message, BoxError>>();
    // room.players.push(tx.clone());

    tokio::spawn(handle_messages(
        receiver,
        sender,
        hub.clone(),
        room.clone(),
        tx,
        rx,
    ));
    Ok(())
}

async fn handle_messages(
    mut receiver: futures::stream::SplitStream<WebSocket>,
    mut sender: SplitSink<WebSocket, Message>,
    hub: Arc<Hub>,
    mut room: Room,
    tx: mpsc::UnboundedSender<Result<Message, BoxError>>,
    rm: mpsc::UnboundedReceiver<Result<Message, BoxError>>,
) -> Result<(), Error> {
    while let Some(result) = receiver.next().await {
        match result {
            Ok(Message::Text(msg)) => {
                log::debug!("Message received: {}", msg);
                let ws_msg: WebSocketMessage = serde_json::from_str(&msg).map_err(|e| {
                    Error::WebsocketError(format!("Failed to deserialize message: {}", e))
                })?;

                if ws_msg.msg_type == "join" {
                    if let Some(username) = ws_msg.payload.get("username") {
                        // Here, you can add the player to the room using the username
                        // room.join(username.clone())?;
                        room.players.push(Player {
                            username: username.clone(),
                            conn: tx.clone(),
                        });
                        log::debug!("Players ------>: {:?}", room.players);
                        sender
                            .send(Message::Text(format!("Welcome to the room, {}!", username)))
                            .await?;
                    } else {
                        log::warn!("Join message missing username");
                    }
                } else {
                    // Handle other message types as needed
                }
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

#[derive(Debug, Clone)]
pub struct Player {
    username: String,
    conn: WsSender,
}
#[derive(Debug, Clone)]
pub struct Room {
    code: String,
    players: Vec<Player>,
    game_engine: GameEngine,
}

impl Room {
    pub fn new(code: String) -> Self {
        Room {
            code,
            players: Vec::new(),
            game_engine: GameEngine::new(),
        }
    }

    pub async fn join(&mut self) -> Result<axum::Json<&'static str>, Html<String>> {
        if self.players.len() >= 2 {
            return Err(Html(format!("<p>Room is full</p>")));
        }

        Ok(axum::Json("Joined"))
    }
}

#[derive(Debug, Clone)]
pub struct GameEngine {
    // Game logic and state
}

impl GameEngine {
    pub fn new() -> Self {
        GameEngine {
            // Initialize game state
        }
    }

    // Game logic methods
}

pub type WsSender = mpsc::UnboundedSender<Result<Message, BoxError>>;

#[derive(Debug, Deserialize)]
struct WebSocketMessage {
    #[serde(rename = "type")]
    msg_type: String,
    payload: std::collections::HashMap<String, String>,
}
