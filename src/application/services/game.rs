use crate::domain::game::{GameSession, Player};
use rand::distributions::Alphanumeric;
use rand::Rng;
use std::collections::HashMap;

pub struct GameSessionService {
    sessions: HashMap<String, GameSession>, // Session code mapped to GameSession
}

impl GameSessionService {
    pub fn new() -> Self {
        Self {
            sessions: HashMap::new(),
        }
    }
    pub fn create_session(&mut self) -> String {
        let code = generate_session_code();
        let session = GameSession::new(code.clone());
        self.sessions.insert(code.clone(), session);
        code
    }

    pub fn join_session(&mut self, code: &String, player: Player) -> Result<(), String> {
        match self.sessions.get_mut(code) {
            Some(session) => session.join(player),
            None => Err("Session not found.".to_string()),
        }
    }

    // Other session service methods here...
}

fn generate_session_code() -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(6)
        .map(char::from)
        .collect()
}
