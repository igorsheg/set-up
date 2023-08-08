mod hand;
mod repository;
mod set;
mod stock;

use std::collections::HashMap;

pub use hand::Hand;
use serde::{Deserialize, Serialize};
pub use set::Set;
pub use stock::Stock;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum GameState {
    WaitingForPlayers,
    InProgress,
    Ended,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Player {
    pub id: u64,
    pub name: String,
    pub score: u32,
}

// #[derive(Debug, Clone, PartialEq)]
// pub struct Game {
//     id: u64,
//     players: std::collections::HashMap<u64, Player>, // Player ID mapped to Player
//     stock: Stock,
//     state: GameState,
// }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameSession {
    pub code: String,
    pub players: HashMap<u64, Player>, // Player ID mapped to Player
    state: GameState,
    hand: Hand,
}
