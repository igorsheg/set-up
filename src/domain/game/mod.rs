mod hand;
mod repository;
mod set;
mod stock;

use std::collections::HashMap;

pub use hand::Hand;
pub use set::Set;
pub use stock::Stock;

#[derive(Debug, Clone, PartialEq)]
pub enum GameState {
    WaitingForPlayers,
    InProgress,
    Ended,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Player {
    id: u64,
    name: String,
    score: u32,
    hand: Hand,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Game {
    id: u64,
    players: std::collections::HashMap<u64, Player>, // Player ID mapped to Player
    stock: Stock,
    state: GameState,
}

pub struct GameSession {
    code: String,
    players: HashMap<u64, Player>, // Player ID mapped to Player
    state: GameState,
}
