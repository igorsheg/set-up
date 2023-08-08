use crate::domain::game::{GameSession, Hand, Player};
use rand::distributions::Alphanumeric;
use rand::Rng;
use std::collections::HashMap;

pub struct GameSessionService {
    pub sessions: HashMap<String, GameSession>, // Session code mapped to GameSession
}

impl Default for GameSessionService {
    fn default() -> Self {
        Self::new()
    }
}

impl GameSessionService {
    pub fn new() -> Self {
        Self {
            sessions: HashMap::new(),
        }
    }

    pub fn get_session(&self, code: &String) -> Option<&GameSession> {
        self.sessions.get(code)
    }

    pub fn get_players(&self, code: &String) -> Option<&HashMap<u64, Player>> {
        self.get_session(code).map(|session| session.get_players())
    }

    pub fn create_session(&mut self, hand: Hand) -> GameSession {
        let code = generate_session_code();
        let session = GameSession::new(code.clone(), hand);
        self.sessions.insert(code.clone(), session.clone());
        session
    }

    pub fn join_session(&mut self, session_code: &String, player: &Player) -> Result<(), String> {
        match self.sessions.get_mut(session_code) {
            Some(session) => session.join(player),
            None => Err("Session not found.".to_string()),
        }
    }
}

fn generate_session_code() -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(6)
        .map(char::from)
        .collect()
}
