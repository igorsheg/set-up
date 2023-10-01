use std::sync::Arc;

use ahash::{HashMap, HashMapExt};
use async_trait::async_trait;
use tokio::sync::{broadcast, mpsc::Sender, Mutex};

use crate::{
    domain::{
        client::Client,
        events::{AppEvent, Command, CommandResult, Event, Topic},
        game::game::Game,
    },
    infra::{
        error::Error,
        event_emmiter::{EventEmitter, EventListener},
    },
};

pub struct ClientService {
    clients: Mutex<HashMap<u16, Arc<Mutex<Client>>>>,
    event_emitter: EventEmitter,
}

impl ClientService {
    pub fn new(event_emitter: EventEmitter) -> Self {
        Self {
            clients: Mutex::new(HashMap::new()),
            event_emitter,
        }
    }

    async fn handle_command(&self, command: Command) -> Result<CommandResult, Error> {
        match command {
            Command::BroadcastGameState(room_code, game_state) => {
                self.broadcast_game_state(room_code, game_state).await
            }
            Command::SetClientRoomCode(client_id, room_code) => {
                self.join_room(client_id, room_code).await
            }
            Command::SetupClient(client_id, tx) => self.setup_or_update_client(client_id, tx).await,
            _ => Ok(CommandResult::NotHandled),
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

    pub async fn setup_or_update_client(
        &self,
        client_id: u16,
        tx: Sender<Game>,
    ) -> Result<CommandResult, Error> {
        if let Ok(client_arc) = self.find_client(client_id).await {
            let mut client = client_arc.lock().await;
            client.tx = tx;
            tracing::info!(client_id = %client_id, "Client updated.");
        } else {
            self.add_client(client_id, Client::new(tx, client_id)).await;
        }
        Ok(CommandResult::ClientSetup(
            "Client setup successful".to_string(),
        ))
    }

    pub async fn remove_client(&self, id: u16) {
        self.clients.lock().await.remove(&id);
        tracing::info!(client_id = %id, "Client removed.");
    }

    pub async fn join_room(
        &self,
        client_id: u16,
        room_code: String,
    ) -> Result<CommandResult, Error> {
        let client_arc = self.find_client(client_id).await.unwrap();
        let mut client = client_arc.lock().await;
        client.set_room_code(room_code.clone());
        Ok(CommandResult::ClientRoomCodeSet(client_id, room_code))
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
        room_code: String,
        game_state: Game,
    ) -> Result<CommandResult, Error> {
        let clients_in_room = self.get_clients_in_room(&room_code).await?;

        for client_arc in clients_in_room {
            let mut client = client_arc.lock().await; // Lock the client
            client.send_message(&game_state).await?;
        }

        Ok(CommandResult::BroadcastDone(
            "Broadcast successful".to_string(),
        ))
    }
}

#[async_trait]
impl EventListener for ClientService {
    async fn get_event_receiver(&self) -> broadcast::Receiver<AppEvent> {
        self.event_emitter.subscribe(Topic::ClientService).await
    }

    async fn handle_event(&self, event: AppEvent) -> Result<(), Error> {
        match event {
            AppEvent::EventOccurred(e) => self.handle_event_occurred(e).await,
            AppEvent::CommandReceived(command, result_sender) => {
                self.handle_received_command(command, result_sender).await
            }
        }
    }

    async fn handle_event_occurred(&self, event: Event) -> Result<(), Error> {
        {
            tracing::debug!("Event not handled: {:?}", event);
            Ok(())
        }
    }

    async fn handle_received_command(
        &self,
        command: Command,
        result_sender: tokio::sync::mpsc::Sender<CommandResult>,
    ) -> Result<(), Error> {
        let result = self.handle_command(command).await?;
        let _ = result_sender.send(result.clone()).await?;

        if let CommandResult::ClientRoomCodeSet(client_id, room_code) = result {
            self.event_emitter
                .emit_app_event(
                    Topic::RoomService,
                    AppEvent::EventOccurred(Event::ClientRoomCodeSet(client_id, room_code)),
                )
                .await?;
        }

        Ok(())
    }
}
