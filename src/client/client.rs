use tokio::sync::mpsc;
use uuid::Uuid;

use crate::{game::game::Game, infra::error::Error};

#[derive(Debug)]
enum ClientState {
    Lobby,
    InRoom(String),
}

#[derive(Debug)]
pub struct Client {
    pub id: Uuid,
    pub tx: mpsc::Sender<Game>,
    state: ClientState,
    // pub room_code: Option<String>,
}

impl Client {
    pub fn new(tx: mpsc::Sender<Game>, id: Uuid) -> Self {
        Self {
            id,
            tx,
            state: ClientState::Lobby,
        }
    }

    pub fn get_room_code(&self) -> Result<&String, Error> {
        match &self.state {
            ClientState::InRoom(room_code) => Ok(room_code),
            ClientState::Lobby => Err(Error::GameError("Client not in a room".to_string())),
        }
    }

    pub async fn send_message(&mut self, message: &Game) -> Result<(), Error> {
        self.tx.send(message.clone()).await.map_err(|err| {
            Error::WebsocketError(format!("Failed to send message to client: {:?}", err))
        })
    }

    pub fn set_room_code(&mut self, room_code: String) {
        self.state = ClientState::InRoom(room_code);
    }
}
