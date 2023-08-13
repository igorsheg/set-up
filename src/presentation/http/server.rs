use axum::{
    extract::{
        ws::{Message, WebSocket},
        WebSocketUpgrade,
    },
    http::Method,
    response::IntoResponse,
    routing::get,
    Extension,
};
use futures::{sink::SinkExt, stream::StreamExt};
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use serde_json::json;
use std::{collections::HashMap, net::SocketAddr, sync::Arc};
use tokio::sync::{mpsc, Mutex, RwLock};
use tower_http::cors::{Any, CorsLayer};
use uuid::Uuid;

use crate::infra::error::Error;

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
                match message {
                    Ok(message) => {
                        // Handle different types of messages
                        match message.r#type.as_str() {
                            "join" => {
                                let mut ctx = context.lock().await;
                                ctx.handle_join(message, client_id).await.unwrap();
                            }
                            "move" => {
                                let mut ctx = context.lock().await;
                                ctx.handle_move(message, client_id).await.unwrap();
                            }
                            "request" => {
                                let mut ctx = context.lock().await;
                                ctx.handle_request().unwrap();
                            }
                            "new" => {
                                let mut ctx = context.lock().await;
                                ctx.handle_new(client_id).await.unwrap();
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
pub struct Context {
    clients: HashMap<Uuid, Client>,
    rooms: HashMap<String, Game>,
}

impl Default for Context {
    fn default() -> Self {
        Self::new()
    }
}

impl Context {
    pub fn new() -> Self {
        Self {
            clients: HashMap::new(),
            rooms: HashMap::new(),
        }
    }

    pub async fn handle_join(&mut self, message: WsMessage, client_id: Uuid) -> Result<(), Error> {
        let room_code = message
            .payload
            .get("room_code")
            .and_then(|v| v.as_str())
            .unwrap_or_default()
            .to_string();
        log::debug!("Client {} joining room {}", client_id, room_code);

        if let Some(game) = self.rooms.get_mut(&room_code) {
            if let Some(client) = self.clients.get(&client_id) {
                if let Some(name) = message.payload.get("name").and_then(|v| v.as_str()) {
                    let player = Player::new(client.id, name.to_string());
                    game.add_player(player);

                    // let payload: HashMap<String, serde_json::Value> =
                    //     serde_json::from_value(json!({ "User joined room": name })).unwrap();
                    // let message = WsMessage {
                    //     r#type: "new_room".to_string(),
                    //     payload,
                    // };
                    client
                        .send_message(self.rooms.get(&room_code).unwrap().clone())
                        .await?;
                }
            } else {
                return Err(Error::GameError("Client not found".to_string()));
            }
        } else {
            return Err(Error::GameError("Game not found".to_string()));
        }

        log::debug!(
            "Rooms: {:?}",
            self.rooms
                .clone()
                .into_iter()
                .map(|(k, v)| (k, v.players))
                .collect::<HashMap<String, Vec<Player>>>()
        );

        Ok(())
    }

    pub async fn handle_move(&mut self, message: WsMessage, client_id: Uuid) -> Result<(), Error> {
        let room_code = message
            .payload
            .get("room_code")
            .and_then(|v| v.as_str())
            .unwrap_or_default()
            .to_string();
        let game_move_json = message
            .payload
            .get("move")
            .ok_or(Error::GameError("Move not found".to_string()))?;

        // Deserialize the game_move
        let game_move: Move = serde_json::from_value(game_move_json.clone())
            .map_err(|_| Error::GameError("Failed to parse move".to_string()))?;

        // Find the game associated with the room code
        if let Some(game) = self.rooms.get_mut(&room_code) {
            // Apply the move to the game state
            game.make_move(client_id, game_move.cards)?;
        } else {
            return Err(Error::GameError("Game not found".to_string()));
        }

        Ok(())
    }

    pub fn handle_request(&mut self) -> Result<(), Error> {
        // Handle a generic request (e.g., requesting game state)
        // You may want to implement specific logic here based on your requirements
        Ok(())
    }

    pub async fn handle_new(&mut self, client_id: Uuid) -> Result<String, Error> {
        // Generate a unique room code
        let room_code = nanoid::nanoid!(6);

        // Create a new game instance
        let mut game = Game::new();
        let mut players = game.players.clone();
        for player in &mut players {
            player.score = 0;
        }
        game.players = players;

        // Add the game to the rooms
        self.rooms.insert(room_code.clone(), game.clone());

        // Optionally, notify the client of the room code
        if let Some(client) = self.clients.get(&client_id) {
            // let payload: HashMap<String, serde_json::Value> =
            //     serde_json::from_value(json!({ "room_code": room_code })).unwrap();
            // let message = WsMessage {
            //     r#type: "new_room".to_string(),
            //     payload,
            // };
            client.send_message(game.clone()).await?;
        }

        log::debug!(
            "Rooms: {:?}",
            self.rooms
                .clone()
                .into_iter()
                .map(|(k, v)| (k, v.players))
                .collect::<HashMap<String, Vec<Player>>>()
        );

        Ok(room_code)
    }
}

#[derive(Debug)]
pub struct Client {
    id: Uuid,
    context: Arc<Mutex<Context>>,
    tx: mpsc::Sender<Game>,
}

impl Client {
    pub fn new(context: Arc<Mutex<Context>>, tx: mpsc::Sender<Game>) -> Self {
        Self {
            id: Uuid::new_v4(),
            context,
            tx,
        }
    }

    pub async fn read(&self) {
        // Handle client reading similar to the Go code
    }

    pub async fn write(&self) {
        // Handle client writing similar to the Go code
    }

    pub async fn send_message(&self, message: Game) -> Result<(), Error> {
        // Serialize the message to JSON
        let json_message = serde_json::to_string(&message).map_err(|_| Error::JsonError);

        // Send the message to the client via the tx channel
        self.tx
            .send(message)
            .await
            .map_err(|_| Error::WebsocketError("Failed to send message to client".to_string()))
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct Player {
    client_id: Uuid,
    name: String,
    score: i32,
}

impl Player {
    pub fn new(client_id: Uuid, name: String) -> Self {
        Player {
            client_id,
            name, // Initialize player attributes
            score: 0,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[repr(i64)]
pub enum Shape {
    Diamond = 0,
    Oval,
    Squiggle,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[repr(i64)]
pub enum Color {
    Red = 0,
    Purple,
    Green,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[repr(i64)]
pub enum Number {
    One = 0,
    Two,
    Three,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[repr(i64)]
pub enum Shading {
    Outlined = 0,
    Striped,
    Solid,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Card {
    shape: Shape,
    color: Color,
    number: Number,
    shading: Shading,
}

#[derive(Debug, Clone, Serialize)]
pub struct Deck {
    cards: Vec<Card>,
}

impl Deck {
    pub fn new() -> Self {
        // Initialize the deck with all possible combinations of cards
        let mut cards = Vec::new();
        for &shape in &[Shape::Diamond, Shape::Oval, Shape::Squiggle] {
            for &color in &[Color::Red, Color::Purple, Color::Green] {
                for &number in &[Number::One, Number::Two, Number::Three] {
                    for &shading in &[Shading::Outlined, Shading::Striped, Shading::Solid] {
                        cards.push(Card {
                            shape,
                            color,
                            number,
                            shading,
                        });
                    }
                }
            }
        }
        Self { cards }
    }

    pub fn shuffle(&mut self) {
        // Shuffle the deck of cards
        use rand::seq::SliceRandom;
        let mut rng = rand::thread_rng();
        self.cards.shuffle(&mut rng);
    }

    pub fn draw(&mut self) -> Option<Card> {
        // Draw a card from the deck
        self.cards.pop()
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct Game {
    deck: Deck,                  // The deck of cards
    game_over: Option<bool>,     // Indicates whether the game is over
    in_play: Vec<Vec<Card>>,     // The cards currently in play, organized in rows
    last_player: Option<String>, // The last player who made a move
    last_set: Option<Vec<Card>>, // The last set of cards played
    players: Vec<Player>,        // The players in the game
    remaining: i64,              // The number of remaining cards in the deck
    state: GameState,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub enum GameState {
    WaitingForPlayers,
    InProgress,
    Ended,
}

impl Game {
    pub fn new() -> Self {
        let mut game = Game {
            deck: Deck::new(),
            game_over: None,
            in_play: vec![vec![], vec![], vec![]],
            last_player: None,
            last_set: None,
            players: vec![],
            remaining: 0,
            state: GameState::WaitingForPlayers,
        };
        game.deal(); // Call the deal method to initialize the in_play and remaining fields
        game
    }

    pub fn add_player(&mut self, player: Player) {
        self.players.push(player);
    }

    pub fn deal(&mut self) {
        // Initialize in_play as a vector of three empty vectors
        let mut in_play = vec![Vec::new(), Vec::new(), Vec::new()];

        // Iterate four times to deal 12 cards in total
        for _ in 0..4 {
            for j in 0..3 {
                // Take the top card from the deck and copy it to the corresponding row
                if let Some(card) = self.deck.draw() {
                    in_play[j].push(card);
                }
            }
        }

        // Update the InPlay and Remaining fields of the game
        self.in_play = in_play;
        self.remaining = self.deck.cards.len() as i64;
    }

    pub fn make_move(&mut self, player_id: Uuid, selected_cards: Vec<Card>) -> Result<(), Error> {
        // Validate the move and update the game state
        if self.state != GameState::InProgress {
            return Err(Error::GameError("Game is not in progress".to_string()));
        }

        if !self.is_valid_set(&selected_cards) {
            return Err(Error::GameError("Invalid set".to_string()));
        }

        // Apply the move
        self.apply_move(player_id, selected_cards);

        Ok(())
    }

    pub fn is_valid_set(&self, selected_cards: &[Card]) -> bool {
        // Check if the selected cards form a valid set according to the game's rules
        // Implement the validation logic here
        true
    }

    pub fn apply_move(&mut self, player_id: Uuid, selected_cards: Vec<Card>) {
        // Apply the player's move to the game state
        // Update scores, remove matched cards, draw new cards, etc.
    }

    // Additional game logic and methods can be implemented here
}

#[derive(Debug, Deserialize)]
struct Move {
    player_id: Option<i64>,
    cards: Vec<Card>,
}
