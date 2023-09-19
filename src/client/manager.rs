use crate::{game::game::Game, infra::error::Error, message::WsMessage};
use std::{collections::HashMap, sync::Arc};
use tokio::sync::Mutex;
use uuid::Uuid;

use super::Client;

pub struct ClientManager {
    clients: Mutex<HashMap<Uuid, Arc<Mutex<Client>>>>,
}

impl Default for ClientManager {
    fn default() -> Self {
        Self::new()
    }
}

impl ClientManager {
    pub fn new() -> Self {
        Self {
            clients: Mutex::new(HashMap::new()),
        }
    }

    pub async fn find_client(&self, client_id: Uuid) -> Result<Arc<Mutex<Client>>, Error> {
        self.clients
            .lock()
            .await
            .get(&client_id)
            .cloned()
            .ok_or(Error::ClientNotFound("Client not found".to_string()))
    }

    pub async fn add_client(&self, id: Uuid, client: Client) {
        self.clients
            .lock()
            .await
            .insert(id, Arc::new(Mutex::new(client)));
        tracing::info!(client_id = %id, "New client added.");
    }

    pub async fn remove_client(&self, id: Uuid) {
        self.clients.lock().await.remove(&id);
        tracing::info!(client_id = %id, "Client removed.");
    }

    pub async fn get_clients_in_room(
        &self,
        room_code: &str,
    ) -> Result<Vec<Arc<Mutex<Client>>>, Error> {
        let mut clients_in_room = Vec::new();

        for client_arc in self.clients.lock().await.values() {
            let client = client_arc.lock().await;
            if let Ok(client_room_code) = client.get_room_code() {
                if client_room_code == room_code {
                    clients_in_room.push(client_arc.clone());
                }
            }
        }

        Ok(clients_in_room)
    }

    pub async fn broadcast_game_state(
        &self,
        message: &WsMessage,
        game_state: &Game,
    ) -> Result<(), Error> {
        let room_code = message.get_room_code()?;
        let clients_in_room = self.get_clients_in_room(&room_code).await?;

        for client_arc in clients_in_room {
            let mut client = client_arc.lock().await; // Lock the client
            client.send_message(game_state).await.map_err(|err| {
                Error::WebsocketError(format!("Failed to send message to client: {:?}", err))
            })?;
        }

        Ok(())
    }
}
