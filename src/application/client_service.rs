use std::sync::Arc;

use ahash::{HashMap, HashMapExt};
use async_trait::async_trait;
use tokio::sync::{broadcast, Mutex};

use crate::{
    domain::{client::Client, events::AppEvent, game::game::Game, message::WsMessage},
    infra::error::Error,
    presentation::ws::event_emmiter::{EventEmitter, EventListener},
};

pub struct ClientService {
    clients: Mutex<HashMap<u16, Arc<Mutex<Client>>>>,
    tx: broadcast::Sender<AppEvent>,
    rx: broadcast::Receiver<AppEvent>,
}

impl ClientService {
    pub fn new(tx: broadcast::Sender<AppEvent>, rx: broadcast::Receiver<AppEvent>) -> Self {
        Self {
            clients: Mutex::new(HashMap::new()),
            tx,
            rx,
        }
    }

    pub async fn find_client(&self, client_id: u16) -> Result<Arc<Mutex<Client>>, Error> {
        self.clients
            .lock()
            .await
            .get(&client_id)
            .cloned()
            .ok_or(Error::ClientNotFound("Client not found".to_string()))
    }

    pub async fn add_client(&self, id: u16, client: Client) {
        self.clients
            .lock()
            .await
            .insert(id, Arc::new(Mutex::new(client)));
        tracing::info!(client_id = %id, "New client added.");
    }

    pub async fn remove_client(&self, id: u16) {
        self.clients.lock().await.remove(&id);
        tracing::info!(client_id = %id, "Client removed.");
    }

    pub async fn join_room(&self, client_id: u16, room_code: String) {
        let client_arc = self.find_client(client_id).await.unwrap();
        let mut client = client_arc.lock().await;
        client.set_room_code(room_code);
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
                tracing::error!("Failed to send message to client: {:?}", err);
                Error::WebsocketError(format!("Failed to send message to client: {:?}", err))
            })?;
        }

        Ok(())
    }
}

#[async_trait]
impl EventListener for ClientService {
    fn get_event_receiver(&self) -> broadcast::Receiver<AppEvent> {
        self.tx.subscribe()
    }

    async fn handle_event(
        &self,
        event: AppEvent,
        event_emitter: &EventEmitter,
    ) -> Result<(), Error> {
        match event {
            AppEvent::BroadcastGameState(message, game_state) => {
                let _ = self.broadcast_game_state(&message, &game_state).await;
                Ok(())
            }
            AppEvent::SetClientRoomCode(client_id, room_code) => {
                self.join_room(client_id, room_code).await;
                Ok(())
            }
            _ => Ok(()),
        }
    }
}
