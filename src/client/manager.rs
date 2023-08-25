use crate::{game::game::Game, infra::error::Error};
use std::collections::HashMap;
use uuid::Uuid;

use super::Client;

pub struct ClientManager {
    clients: HashMap<Uuid, Client>,
}

impl ClientManager {
    pub fn new() -> Self {
        Self {
            clients: HashMap::new(),
        }
    }

    pub fn find_client(&mut self, client_id: Uuid) -> Result<&mut Client, Error> {
        self.clients
            .get_mut(&client_id)
            .ok_or(Error::ClientNotFound("Client not found".to_string()))
    }

    pub fn add_client(&mut self, id: Uuid, client: Client) {
        self.clients.insert(id, client);
    }

    pub fn remove_client(&mut self, id: Uuid) {
        self.clients.remove(&id);
    }

    pub fn get_clients_in_room(&self, room_code: &str) -> Vec<&Client> {
        self.clients
            .values()
            .filter(|client| client.room_code.as_ref() == Some(&room_code.to_string()))
            .collect()
    }

    pub async fn send_message(&mut self, message: &Game, client_id: Uuid) -> Result<(), Error> {
        if let Some(client) = self.clients.get_mut(&client_id) {
            client.tx.send(message.clone()).await.map_err(|err| {
                Error::WebsocketError(format!("Failed to send message to client: {:?}", err))
            })
        } else {
            Err(Error::WebsocketError("Client not found".to_string()))
        }
    }
}
