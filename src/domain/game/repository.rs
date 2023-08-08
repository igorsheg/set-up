use std::collections::HashMap;

use super::{GameSession, GameState, Hand, Player};

impl GameSession {
    pub fn new(code: String, hand: Hand) -> Self {
        Self {
            code,
            players: HashMap::new(),
            state: GameState::WaitingForPlayers,
            hand,
        }
    }

    pub fn join(&mut self, player: &Player) -> Result<(), String> {
        if self.state != GameState::WaitingForPlayers {
            return Err("Game already started.".to_string());
        }
        if self.players.len() >= 2 {
            return Err("Game is full.".to_string());
        }
        self.players.insert(player.id, player.clone());
        if self.players.len() == 2 {
            self.state = GameState::InProgress;
        }
        Ok(())
    }

    pub fn get_players(&self) -> &HashMap<u64, Player> {
        &self.players
    }
}
