use axum::{
    extract::{
        ws::{Message, WebSocket},
        Path, Query, WebSocketUpgrade,
    },
    http::Method,
    response::IntoResponse,
    routing::get,
    Extension,
};
use futures::{
    sink::SinkExt,
    stream::{SplitSink, SplitStream, StreamExt},
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::{
    collections::HashMap,
    convert::Infallible,
    net::{IpAddr, Ipv4Addr, SocketAddr},
    sync::Arc,
};
use tokio::sync::{mpsc, Mutex, RwLock};
use tower_http::cors::{Any, CorsLayer};

use crate::infra::error::{AppError, Error};

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

        let context = Arc::new(Mutex::new(Context::new()));

        let app = axum::Router::new()
            .route("/ws", get(game_routes))
            .layer(cors)
            .layer(Extension(context));

        println!("Listening on {}", &addr);

        axum::Server::bind(&addr)
            .serve(app.into_make_service())
            .await
            .unwrap();
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WsMessage {
    pub r#type: String,
    pub payload: HashMap<String, serde_json::Value>,
}

#[axum::debug_handler]
pub async fn game_routes(
    ws: WebSocketUpgrade,
    Extension(context): Extension<Arc<Mutex<Context>>>,
    // Extension(remote_addr): Extension<SocketAddr>,
) -> impl IntoResponse {
    // println!("Incoming websocket connection from: {}", remote_addr);
    let remote_addr = SocketAddr::new(IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)), 8080);
    log::debug!("Incoming websocket connection from: {}", remote_addr);
    ws.on_upgrade(move |socket| async move {
        if let Err(err) = handle_connection(socket, context, remote_addr).await {
            log::error!("An error occurred in the websocket handler: {}", err);
        }
    })
}

pub async fn handle_connection(
    ws: WebSocket,
    context: Arc<Mutex<Context>>,
    remote_addr: SocketAddr,
) -> Result<(), Error> {
    let (tx, rx) = mpsc::channel(32);
    let client = Client::new(context.clone(), tx, rx);

    // Register the client with the context
    {
        let mut ctx = context.lock().await;
        ctx.clients.insert(remote_addr, client);
    }

    // Spawn separate tasks for reading and writing to better control each direction of the communication
    let (ws_tx, ws_rx) = ws.split();

    let context_clone = context.clone(); // Clone the Arc

    // Reader task
    let reader_task = tokio::spawn(async move {
        let mut ws_rx = ws_rx;
        while let Some(Ok(msg)) = ws_rx.next().await {
            if let Ok(text) = msg.to_text() {
                let message: Result<WsMessage, _> = serde_json::from_str(text);
                match message {
                    Ok(message) => {
                        // Handle different types of messages
                        match message.r#type.as_str() {
                            "join" => {
                                let mut ctx = context.lock().await;
                                ctx.handle_join(message, &ws_tx, remote_addr).unwrap();
                            }
                            "move" => {
                                let mut ctx = context.lock().await;
                                ctx.handle_move(message, &ws_tx, remote_addr).unwrap();
                            }
                            "request" => {
                                let mut ctx = context.lock().await;
                                ctx.handle_request(&ws_tx).unwrap();
                            }
                            "new" => {
                                let mut ctx = context.lock().await;
                                ctx.handle_new().unwrap();
                            }
                            _ => {
                                log::warn!("Unrecognized message type: {}", message.r#type);
                            }
                        }
                    }
                    Err(err) => {
                        log::error!("Failed to parse WebSocket message: {}", err);
                    }
                }
            }
        }
    });

    // Writer task
    let writer_task = tokio::spawn(async move {
        // ... Handle the writer logic, sending messages to the client ...
    });

    // Wait for both tasks to complete
    tokio::try_join!(reader_task, writer_task);

    // Unregister the client from the context
    {
        let mut ctx = context_clone.lock().await;
        ctx.clients.remove(&remote_addr);
    }

    Ok(())
}

pub struct Context {
    clients: HashMap<SocketAddr, Client>,
    rooms: HashMap<String, GameEngine>,
    // Additional attributes related to the context
}

impl Context {
    pub fn new() -> Self {
        Self {
            clients: HashMap::new(),
            rooms: HashMap::new(),
            // Initialize other attributes
        }
    }

    pub fn handle_join(
        &mut self,
        message: WsMessage,
        conn: &SplitSink<WebSocket, Message>,
        remote_addr: SocketAddr,
    ) -> Result<(), Error> {
        // Extract room code from message payload
        let room_code = message
            .payload
            .get("room_code")
            .and_then(|v| v.as_str())
            .unwrap_or_default()
            .to_string();

        log::debug!("Client {} joining room {}", remote_addr, room_code);

        // Get the corresponding game engine
        if let Some(game_engine) = self.rooms.get_mut(&room_code) {
            // Register the client
            if let Some(client) = self.clients.remove(&remote_addr) {
                game_engine.register_client(client);
            } else {
                return Err(Error::GameError("Client not found".to_string()));
            }
        } else {
            return Err(Error::GameError("Game not found".to_string()));
        }

        Ok(())
    }

    pub fn handle_move(
        &mut self,
        message: WsMessage,
        conn: &SplitSink<WebSocket, Message>,
        remote_addr: SocketAddr,
    ) -> Result<(), Error> {
        // Extract client from connection
        // let client_addr = conn.remote_addr().unwrap();
        let client = self.clients.get(&remote_addr).ok_or(Error::ClientNotFound);

        // Determine the room code (or any other way to identify the game)
        let room_code = message
            .payload
            .get("room_code")
            .and_then(|v| v.as_str())
            .unwrap_or_default()
            .to_string();

        // Get the corresponding game engine and process the move
        if let Some(game_engine) = self.rooms.get_mut(&room_code) {
            game_engine.process_moves(remote_addr, message);
        } else {
            return Err(Error::GameError("Game not found".to_string()));
        }

        Ok(())
    }

    pub fn handle_request(&mut self, conn: &SplitSink<WebSocket, Message>) -> Result<(), Error> {
        // Handle a generic request (e.g., requesting game state)
        // You may want to implement specific logic here based on your requirements

        Ok(())
    }

    pub fn handle_new(&mut self) -> Result<(), Error> {
        // Create a new game and add it to the rooms
        let room_code = nanoid::nanoid!(6); // Generate a unique room code
        let game_engine = GameEngine::new();
        self.rooms.insert(room_code, game_engine);

        Ok(())
    }
}

pub struct Client {
    context: Arc<Mutex<Context>>,
    tx: mpsc::Sender<WsMessage>,
    rx: mpsc::Receiver<WsMessage>,
    remote_addr: Option<SocketAddr>,
    // Additional attributes related to the client
}

impl Client {
    pub fn new(
        context: Arc<Mutex<Context>>,
        tx: mpsc::Sender<WsMessage>,
        rx: mpsc::Receiver<WsMessage>,
    ) -> Self {
        Self {
            context,
            tx,
            rx,
            remote_addr: None,
        }
    }

    pub async fn read(&self) {
        // Handle client reading similar to the Go code
    }

    pub async fn write(&self) {
        // Handle client writing similar to the Go code
    }

    pub async fn send_message(&self, message: WsMessage) -> Result<(), Error> {
        // Serialize the message to JSON
        let json_message = serde_json::to_string(&message).map_err(|_| Error::JsonError);

        // Send the message to the client via the tx channel
        self.tx
            .send(message)
            .await
            .map_err(|_| Error::WebsocketError("Failed to send message to client".to_string()))
    }
}

pub struct GameEngine {
    state: RwLock<GameState>,
    clients: HashMap<SocketAddr, Client>,
}

impl GameEngine {
    pub fn new() -> Self {
        GameEngine {
            state: RwLock::new(GameState::new()),
            clients: HashMap::new(),
        }
    }

    pub async fn process_moves(
        &self,
        client_addr: SocketAddr,
        game_move: WsMessage,
    ) -> Result<(), Error> {
        // Retrieve the client associated with the move
        let client = self.clients.get(&client_addr).unwrap();

        // Process the move and update the game state
        let mut state = self.state.write().await;
        state.apply_move(client, game_move)?;

        // Notify all clients of the update
        self.notify_clients().await?;

        Ok(())
    }

    pub async fn notify_clients(&self) -> Result<(), Error> {
        // Create the response message
        let payload: HashMap<String, serde_json::Value> = serde_json::from_value(
            serde_json::json!({ "game_state": self.state.read().await.to_json() }),
        )
        .unwrap();
        let message = WsMessage {
            r#type: "update".to_string(),
            payload,
        };

        // Send the response to all clients
        for client in self.clients.values() {
            client.send_message(message.clone()).await?;
        }

        Ok(())
    }

    pub fn register_client(&mut self, client: Client) {
        self.clients.insert(client.remote_addr.unwrap(), client);
    }

    pub fn unregister_client(&mut self, remote_addr: SocketAddr) {
        self.clients.remove(&remote_addr);
    }
}

#[derive(Debug, Clone)]
pub struct GameState {
    players: Vec<Player>,
    // Other game-related state can be added here
}

impl GameState {
    pub fn new() -> Self {
        GameState {
            players: Vec::new(),
            // Initialize other game-related state
        }
    }

    pub fn apply_move(&mut self, client: &Client, game_move: WsMessage) -> Result<(), Error> {
        // Apply the move to the game state
        // Update players, board, etc.

        // Example: you might want to match the type of move and apply it accordingly
        match game_move.r#type.as_str() {
            "move" => {
                // Handle the move logic here
            }
            _ => {
                return Err(Error::UnknownMove(game_move.r#type));
            }
        }

        Ok(())
    }

    pub fn to_json(&self) -> serde_json::Value {
        // Convert the game state to JSON
        // You can implement this based on your specific game state structure
        json!({
            "players": self.players,
        })
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct Player {
    // Player-related attributes can be added here
}

impl Player {
    pub fn new() -> Self {
        Player {
            // Initialize player attributes
        }
    }
}
