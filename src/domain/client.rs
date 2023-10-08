use std::sync::Arc;

use async_trait::async_trait;
use tokio::sync::{mpsc::UnboundedSender, Mutex};

use super::{events::CommandResult, game::game::Game};
use crate::infra::error::Error;

#[derive(Debug, Eq, PartialEq)]
pub enum ClientState {
    Lobby,
    InRoom(String),
}

#[derive(Debug)]
pub struct Client {
    pub id: u16,
    pub tx: UnboundedSender<Game>,
    state: ClientState,
    past_rooms: Vec<String>,
}

impl Client {
    pub fn new(tx: UnboundedSender<Game>, id: u16) -> Self {
        Self {
            id,
            tx,
            state: ClientState::Lobby,
            past_rooms: vec![],
        }
    }

    pub fn get_room_code(&self) -> Option<String> {
        match &self.state {
            ClientState::InRoom(room_code) => Some(room_code.clone()),
            ClientState::Lobby => None,
        }
    }

    pub async fn send_message(&self, game_state: &Game) -> Result<(), Error> {
        self.tx.send(game_state.clone()).map_err(|err| {
            Error::WebsocketError(format!("Failed to send game state to client: {:?}", err))
        })
    }

    pub fn join_room(&mut self, room_code: String) {
        self.state = ClientState::InRoom(room_code.clone());
        if !self.past_rooms.contains(&room_code) {
            self.past_rooms.push(room_code);
        }
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

#[async_trait]
pub trait ClientServiceTrait {
    async fn find_client(&self, client_id: u16) -> Result<Arc<Mutex<Client>>, Error>;
    async fn add_client(&self, id: u16, client: Client);
    async fn setup_or_update_client(
        &self,
        client_id: u16,
        tx: UnboundedSender<Game>,
    ) -> Result<CommandResult, Error>;
    async fn remove_client(&self, id: u16) -> Result<(), Error>;
    async fn join_room(&self, client_id: u16, room_code: String) -> Result<CommandResult, Error>;
    async fn get_clients_in_room(&self, room_code: &str) -> Result<Vec<Arc<Mutex<Client>>>, Error>;
    async fn broadcast_game_state(
        &self,
        room_code: String,
        game_state: Arc<Mutex<Game>>,
    ) -> Result<CommandResult, Error>;
}
