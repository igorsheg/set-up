use tokio::sync::mpsc;

use super::game::game::Game;
use crate::infra::error::Error;

#[derive(Debug, Eq, PartialEq)]
pub enum ClientState {
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

    pub async fn send_message(&self, message: &Game) -> Result<(), Error> {
        self.tx.send(message.clone()).await.map_err(|err| {
            Error::WebsocketError(format!("Failed to send message to client: {:?}", err))
        })
    }

    pub fn join_room(&mut self, room_code: String) {
        self.state = ClientState::InRoom(room_code.clone());
        self.add_past_room(room_code);
    }

    pub fn get_past_rooms(&self) -> &Vec<String> {
        &self.past_rooms
    }

    pub fn add_past_room(&mut self, room_code: String) {
        self.past_rooms.push(room_code.clone());
    }

    pub fn get_client_state(&self) -> &ClientState {
        &self.state
    }

    pub fn is_in_room(&self) -> bool {
        matches!(self.state, ClientState::InRoom(_))
    }

    pub fn remove_past_room(&mut self, room_code: &str) {
        self.past_rooms.retain(|room| room != room_code);
    }
}
