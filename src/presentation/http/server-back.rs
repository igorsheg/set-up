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
use rand::seq::SliceRandom;
use rand::thread_rng;
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
    let room = Room::new(room_code.clone()).unwrap();
    let register_tx = room.register.clone();
    tokio::spawn(async move { room.clone().run().await });

    hub.rooms
        .lock()
        .await
        .insert(room_code.clone(), room.clone());

    Html(format!("<p>Room created with code: {}</p>", room_code))
}

pub async fn join_room(
    Extension(hub): Extension<Arc<Hub>>,
    Path(room_code): Path<String>,
) -> Result<axum::Json<&'static str>, Html<String>> {
    let rooms = hub.rooms.lock().await;
    if let Some(_room) = rooms.get(&room_code) {
        Ok(axum::Json("Success"))
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

async fn websocket(
    stream: WebSocket,
    room_code: String,
    register_tx: mpsc::UnboundedSender<Player>,
) -> Result<(), Error> {
    let (sender, receiver) = stream.split();

    // Create the player's sender channel
    let (tx, mut rx) = mpsc::unbounded_channel::<Result<Message, BoxError>>();

    // Register the player
    let username = "username".to_string(); // Retrieve username from a proper source
    register_tx
        .send(Player {
            username: username.clone(),
            sender: tx,
        })
        .unwrap();

    // Handle player messages
    tokio::spawn(async move {
        while let Some(message) = rx.recv().await {
            // Send messages to the player
            sender.send(message).await.unwrap();
        }
    });

    // Handle messages from the player
    while let Some(result) = receiver.next().await {
        match result {
            // ... handle incoming messages, such as actions in the game ...
        }
    }

    Ok(())
}

async fn handle_messages(
    mut receiver: futures::stream::SplitStream<WebSocket>,
    mut sender: SplitSink<WebSocket, Message>,
    room: Room,
    tx: mpsc::UnboundedSender<Result<Message, BoxError>>,
) -> Result<(), Error> {
    while let Some(result) = receiver.next().await {
        match result {
            Ok(Message::Text(msg)) => {
                // Handle text messages
            } // ... other message handling ...
            Err(e) => {
                log::error!("Error receiving message: {}", e);
                break;
            }
            Ok(ping) => {
                // Handle ping
            }
        }
    }
    Ok(())
}

#[derive(Debug, Clone)]
pub struct Player {
    username: String,
    sender: WsSender,
}
#[derive(Debug, Clone)]
pub struct Room {
    code: String,
    players: HashMap<String, Player>,
    game_engine: GameEngine,
    register: mpsc::UnboundedSender<Player>,
    register_receiver: mpsc::UnboundedReceiver<Player>,
    unregister: mpsc::UnboundedSender<Player>,
    broadcast: mpsc::UnboundedSender<Result<Message, BoxError>>,
}

impl Room {
    pub fn new(code: String) -> Result<Self, BoxError> {
        let (register_tx, register_rx) = mpsc::unbounded_channel();
        let (unregister_tx, _) = mpsc::unbounded_channel();
        let (broadcast_tx, _) = mpsc::unbounded_channel();

        Ok(Room {
            code,
            players: HashMap::new(),
            game_engine: GameEngine::new(),
            register: register_tx,
            register_receiver: register_rx,
            unregister: unregister_tx,
            broadcast: broadcast_tx,
        })
    }

    pub async fn run(mut self) {
        loop {
            tokio::select! {
                Some(player) = self.register_receiver.recv() => {
                    // Handle player registration
                    self.players.insert(player.username.clone(), player);
                    if self.players.len() == 2 {
                        // Initialize the game if two players are present
                        self.game_engine = GameEngine::new();
                    }
                }
                // ... other cases ...
            }
        }
    }

    pub async fn join(&mut self, username: String, sender: WsSender) -> Result<(), Error> {
        // Check if the game is over, and if so, create a new game
        if self.game_engine.is_game_over() {
            self.game_engine = GameEngine::new();
        }

        // Create the Player
        let player = Player {
            username: username.clone(),
            sender,
        };

        // Register the player
        self.register.send(player).unwrap();

        Ok(())
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Color {
    Red,
    Green,
    Purple,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Shape {
    Oval,
    Squiggle,
    Diamond,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Shading {
    Solid,
    Striped,
    Open,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Number {
    One,
    Two,
    Three,
}

#[derive(Debug, Clone)]
pub struct Card {
    color: Color,
    shape: Shape,
    shading: Shading,
    number: Number,
}

#[derive(Debug, Clone)]
pub struct Deck {
    cards: Vec<Card>,
}

impl Deck {
    pub fn new() -> Self {
        let mut cards = Vec::new();
        // Generate all combinations of cards and add them to the deck
        // ...

        // Shuffle the deck
        let mut rng = thread_rng();
        cards.shuffle(&mut rng);

        Deck { cards }
    }

    pub fn draw(&mut self) -> Option<Card> {
        self.cards.pop()
    }
}

#[derive(Debug, Clone)]
pub struct GameEngine {
    deck: Deck,
    board: Vec<Card>,
    players: Vec<Player>,
    // Additional game state and logic
}

impl GameEngine {
    pub fn new() -> Self {
        let mut deck = Deck::new();
        let mut board = Vec::new();
        for _ in 0..12 {
            if let Some(card) = deck.draw() {
                board.push(card);
            }
        }

        GameEngine {
            deck,
            board,
            players: Vec::new(),
        }
    }

    pub fn is_game_over(&self) -> bool {
        // Logic to check if the game is over (e.g., no more valid sets, deck empty, etc.)
        false
    }

    // Additional methods for game logic, e.g., validating sets, scoring, etc.
}

pub type WsSender = mpsc::UnboundedSender<Result<Message, BoxError>>;

#[derive(Debug, Deserialize)]
struct WebSocketMessage {
    #[serde(rename = "type")]
    msg_type: String,
    payload: std::collections::HashMap<String, String>,
}
