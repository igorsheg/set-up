use std::sync::Arc;

use ahash::{HashMap, HashMapExt};
use tokio::sync::{mpsc, Mutex};

use super::client_service::ClientService;
use crate::{
    domain::{
        events::{AppEvent, EventHandler},
        game::game::{Game, GameMode},
        message::WsMessage,
        room::Room,
    },
    infra::error::Error,
};

pub struct RoomService {
    rooms: Mutex<HashMap<String, Arc<Room>>>,
    rx: Mutex<mpsc::Receiver<AppEvent>>,
}

impl RoomService {
    pub fn new(rx: Mutex<mpsc::Receiver<AppEvent>>) -> Self {
        Self {
            rooms: Mutex::new(HashMap::new()),
            rx,
        }
    }

    pub async fn listen_for_events(&self) {
        tracing::info!("Listening for events...");
        while let Some(event) = self.rx.lock().await.recv().await {
            tracing::info!("Event received");
            match event {
                AppEvent::PlayerJoined(client_id, message) => {
                    tracing::info!("Player joined ----> {}", client_id);
                    // handle player joined event
                } // Handle other events as needed...
            }
        }
    }

    // Application-level methods like handle_join, handle_leave, etc.
    pub async fn handle_join(
        &self,
        message: WsMessage,
        client_id: u16,
        client_manager: &ClientService,
    ) -> Result<(), Error> {
        Ok(())
    }

    pub async fn get_game_state(&self, room_code: &str) -> Result<Arc<Mutex<Game>>, Error> {
        let rooms = self.rooms.lock().await;
        match rooms.get(room_code) {
            Some(room) => Ok(room.get_game_state().await),
            None => Err(Error::RoomNotFound(format!("Room {} not found", room_code))),
        }
    }

    pub async fn start_new_game(&self, mode: GameMode) -> Result<String, Error> {
        use rand::{distributions::Alphanumeric, thread_rng, Rng};

        let room_code: String = thread_rng()
            .sample_iter(&Alphanumeric)
            .take(6)
            .map(char::from)
            .collect();

        let game = Game::new(mode);
        let room = Room::new(game);

        let mut rooms = self.rooms.lock().await;
        rooms.insert(room_code.clone(), Arc::new(room));

        println!("New game started in room: {}", room_code);

        Ok(room_code)
    }
}
