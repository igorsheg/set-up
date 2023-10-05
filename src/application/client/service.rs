use std::sync::Arc;

use ahash::{HashMap, HashMapExt};
use tokio::sync::{mpsc::Sender, RwLock};

use crate::{
    domain::{
        client::Client,
        events::{CommandResult, Event, Topic},
        game::game::Game,
    },
    infra::{error::Error, event_emmiter::EventEmitter},
};

pub struct ClientService {
    clients: RwLock<HashMap<u16, Arc<RwLock<Client>>>>,
    pub(super) event_emitter: EventEmitter,
}

impl ClientService {
    pub fn new(event_emitter: EventEmitter) -> Self {
        Self {
            clients: RwLock::new(HashMap::new()),
            event_emitter,
        }
    }

    pub async fn find_client(&self, client_id: u16) -> Result<Arc<RwLock<Client>>, Error> {
        self.clients
            .read()
            .await
            .get(&client_id)
            .cloned()
            .ok_or(Error::ClientNotFound("Client not found".to_string()))
    }

    pub async fn add_client(&self, id: u16, client: Client) {
        self.clients
            .write()
            .await
            .insert(id, Arc::new(RwLock::new(client)));
    }

    pub async fn setup_or_update_client(
        &self,
        client_id: u16,
        tx: Sender<Game>,
    ) -> Result<CommandResult, Error> {
        let mut clients = self.clients.write().await;

        if let Some(client_arc) = clients.get(&client_id) {
            let mut client = client_arc.write().await;
            client.tx = tx;
        } else {
            clients.insert(client_id, Arc::new(RwLock::new(Client::new(tx, client_id))));
        }

        Ok(CommandResult::ClientSetup(
            "Client setup successful".to_string(),
        ))
    }

    pub async fn remove_client(&self, id: u16) -> Result<(), Error> {
        if let Some(client_arc) = self.clients.write().await.remove(&id) {
            let client = client_arc.read().await;
            let room_code = client.get_room_code();
            self.event_emitter
                .emit_event(Topic::RoomService, Event::ClientRemoved(id, room_code))
                .await?;
        } else {
            return Err(Error::ClientNotFound("Client not found".to_string()));
        }
        Ok(())
    }

    pub async fn join_room(
        &self,
        client_id: u16,
        room_code: String,
    ) -> Result<CommandResult, Error> {
        let client_arc = self.find_client(client_id).await?;
        let mut client = client_arc.write().await;

        client.join_room(room_code.clone());

        self.event_emitter
            .emit_event(
                Topic::RoomService,
                Event::PlayerJoinedRoom(client_id, room_code.clone()),
            )
            .await?;

        Ok(CommandResult::ClientRoomCodeSet(client_id, room_code))
    }

    pub async fn get_clients_in_room(
        &self,
        room_code: &str,
    ) -> Result<Vec<Arc<RwLock<Client>>>, Error> {
        let mut clients_in_room = Vec::new();

        for client_arc in self.clients.read().await.values() {
            let client = client_arc.read().await;
            if let Some(client_room_code) = client.get_room_code() {
                if client_room_code == room_code {
                    clients_in_room.push(client_arc.clone());
                }
            }
        }

        Ok(clients_in_room)
    }

    pub async fn broadcast_game_state(
        &self,
        room_code: String,
        game_state: Arc<RwLock<Game>>,
    ) -> Result<CommandResult, Error> {
        let clients_in_room = self.get_clients_in_room(&room_code).await?;
        let game_state = game_state.read().await;

        for client_arc in clients_in_room {
            let client = client_arc.read().await;

            client.send_message(&game_state).await?;
        }

        Ok(CommandResult::BroadcastDone(
            "Broadcast successful".to_string(),
        ))
    }
}
