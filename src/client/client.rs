use tokio::sync::mpsc;

use crate::{game::game::Game, infra::error::Error};

#[derive(Debug)]
enum ClientState {
    Lobby,
    InRoom(String),
}

#[derive(Debug)]
pub struct Client {
    pub id: u16,
    pub tx: mpsc::Sender<Game>,
    state: ClientState,
    past_rooms: Vec<String>,
}

impl Client {
    pub fn new(tx: mpsc::Sender<Game>, id: u16) -> Self {
        Self {
            id,
            tx,
            state: ClientState::Lobby,
            past_rooms: vec![],
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
        self.state = ClientState::InRoom(room_code.clone());
        self.add_past_room(room_code);
    }

    pub fn get_past_rooms(&self) -> &Vec<String> {
        &self.past_rooms
    }

    pub fn add_past_room(&mut self, room_code: String) {
        self.past_rooms.push(room_code.clone());
    }

    pub fn remove_past_room(&mut self, room_code: &str) {
        self.past_rooms.retain(|room| room != room_code);
    }
}
