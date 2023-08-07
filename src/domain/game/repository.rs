use std::collections::HashMap;

use super::{GameSession, GameState, Player};

impl GameSession {
    pub fn new(code: String) -> Self {
        Self {
            code,
            players: HashMap::new(),
            state: GameState::WaitingForPlayers,
        }
    }

    pub fn join(&mut self, player: Player) -> Result<(), String> {
        if self.state != GameState::WaitingForPlayers {
            return Err("Game already started.".to_string());
        }
        if self.players.len() >= 2 {
            return Err("Game is full.".to_string());
        }
        self.players.insert(player.id, player);
        if self.players.len() == 2 {
            self.state = GameState::InProgress;
        }
        Ok(())
    }

    // Other game management methods here...
}
