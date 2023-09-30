use std::sync::Arc;

use ahash::{HashMap, HashMapExt};
use async_trait::async_trait;
use tokio::sync::{broadcast, mpsc, Mutex};

use crate::{
    domain::{
        events::AppEvent,
        game::{
            game::{Game, GameMode},
            player::Player,
        },
        message::WsMessage,
        room::Room,
    },
    infra::{ba, error::Error},
    presentation::ws::event_emmiter::{EventEmitter, EventListener},
};

pub struct RoomService {
    rooms: Mutex<HashMap<String, Arc<Room>>>,
    tx: broadcast::Sender<AppEvent>,
    rx: broadcast::Receiver<AppEvent>,
}

impl RoomService {
    pub fn new(tx: broadcast::Sender<AppEvent>, rx: broadcast::Receiver<AppEvent>) -> Self {
        Self {
            rooms: Mutex::new(HashMap::new()),
            tx,
            rx,
        }
    }

    pub async fn handle_join(
        &self,
        message: WsMessage,
        client_id: u16,
        event_emitter: &EventEmitter,
    ) -> Result<(), Error> {
        let room_code = message.get_room_code()?;
        let game_state_arc = self.get_game_state(&room_code).await?;
        let mut game_state = game_state_arc.lock().await;

        // This block updates the game state and then emits an event indicating the game state has changed
        {
            if game_state.restore_player(client_id).is_err() {
                let player_username = message.get_player_username()?;
                let player = Player::new(client_id, player_username);
                game_state.add_player(player.clone());

                tracing::info!(
                    event_type = %ba::EventType::PlayerRejoined,
                    client_id = %client_id,
                    player_name = %player.name,
                );
            }

            event_emitter
                .emit(AppEvent::SetClientRoomCode(client_id, room_code.clone()))
                .await?;
        }

        // Emit an event to broadcast the game state
        event_emitter
            .emit(AppEvent::BroadcastGameState(message, game_state.clone()))
            .await?;

        Ok(())
    }

    pub async fn get_game_state(&self, room_code: &str) -> Result<Arc<Mutex<Game>>, Error> {
        let rooms = self.rooms.lock().await;
        match rooms.get(room_code) {
            Some(room) => Ok(room.get_game_state().await),
            None => Err(Error::RoomNotFound(format!("Room {} not found", room_code))),
        }
    }

    async fn handle_update_game_state(
        &self,
        client_id: u16,
        room_code: String,
    ) -> Result<(), Error> {
        tracing::info!(
            event_type = %ba::EventType::PlayerJoined,
            room_code = %room_code,
            client_id = %client_id,
        );

        // Any other logic related to updating the game state can go here.
        Ok(())
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

#[async_trait]
impl EventListener for RoomService {
    fn get_event_receiver(&self) -> broadcast::Receiver<AppEvent> {
        self.tx.subscribe()
    }

    async fn handle_event(
        &self,
        event: AppEvent,
        event_emitter: &EventEmitter,
    ) -> Result<(), Error> {
        match event {
            AppEvent::PlayerJoined(client_id, _message) => {
                tracing::info!("Player joined ----> {}", client_id);
                Ok(())
            }
            AppEvent::RequestPlayerJoin(client_id, message) => {
                self.handle_join(message, client_id, event_emitter).await
            }
            AppEvent::UpdateGameState(client_id, room_code) => {
                self.handle_update_game_state(client_id, room_code).await
            }
            _ => Ok(()),
        }
    }
}
