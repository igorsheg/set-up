use crate::{infra::error::Error, message::WsMessage, room::RoomManager};
use std::collections::HashMap;
use uuid::Uuid;

use super::Client;

pub struct ClientManager {
    clients: HashMap<Uuid, Client>,
}

impl Default for ClientManager {
    fn default() -> Self {
        Self::new()
    }
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
        tracing::info!(client_id = %id, "New client added.");
    }

    pub fn remove_client(&mut self, id: Uuid) {
        self.clients.remove(&id);
        tracing::info!(client_id = %id, "Client removed.");
    }

    pub fn get_clients_in_room(&mut self, room_code: &str) -> Vec<&mut Client> {
        self.clients
            .values_mut()
            .filter(|client| {
                if let Ok(client_room_code) = client.get_room_code() {
                    client_room_code == room_code
                } else {
                    false
                }
            })
            .collect()
    }

    pub async fn broadcast_game_state(
        &mut self,
        message: &WsMessage,
        room_manager: &mut RoomManager,
    ) -> Result<(), Error> {
        let room_code = message.get_room_code()?;

        let game_state = room_manager.get_game_state(&room_code)?;
        let clients_in_room = self.get_clients_in_room(&room_code);

        for client in clients_in_room {
            client.send_message(game_state).await.map_err(|err| {
                Error::WebsocketError(format!("Failed to send message to client: {:?}", err))
            })?;
        }

        Ok(())
    }
}
