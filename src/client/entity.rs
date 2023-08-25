use tokio::sync::mpsc;
use uuid::Uuid;

use crate::game::game::Game;

#[derive(Debug)]
pub struct Client {
    pub id: Uuid,
    pub tx: mpsc::Sender<Game>,
    pub room_code: Option<String>,
}

impl Client {
    pub fn new(tx: mpsc::Sender<Game>, id: Uuid) -> Self {
        Self {
            id,
            tx,
            room_code: None,
        }
    }
}
