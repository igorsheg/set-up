use std::sync::Arc;

use ahash::{HashMap, HashMapExt};
use async_trait::async_trait;
use tokio::sync::Mutex;

use crate::{
    domain::{
        events::{Command, CommandResult, Event, Topic},
        game::game::{Game, GameMode, Move},
        message::WsMessage,
        room::{Room, RoomServiceTrait},
    },
    infra::{error::Error, event_emmiter::EventEmitter},
};

const ROOM_CODE_LENGTH: usize = 6;

#[derive(Clone)]
pub struct RoomService {
    rooms: Arc<Mutex<HashMap<String, Arc<Room>>>>,
    pub(super) event_emitter: EventEmitter,
}

impl RoomService {
    pub fn new(event_emitter: EventEmitter) -> Self {
        Self {
            rooms: Arc::new(Mutex::new(HashMap::new())),
            event_emitter,
        }
    }

    pub async fn handle_join(
        &self,
        message: WsMessage,
        client_id: u16,
    ) -> Result<CommandResult, Error> {
        let room_code = message.get_room_code()?;
        let player_username = message.get_player_username()?;

        let room = self.get_room(&room_code).await?;
        room.join_player(client_id, player_username).await?;

        self.event_emitter
            .emit_command(
                Topic::ClientService,
                Command::SetClientRoomCode(client_id, room_code.clone()),
            )
            .await?;

        Ok(CommandResult::PlayerJoined(client_id))
    }

    pub async fn handle_player_move(
        &self,
        client_id: u16,
        message: WsMessage,
    ) -> Result<CommandResult, Error> {
        let game_move: Move = message.get_payload_as()?;
        let room_code = &game_move.room_code;
        let room = self.get_room(room_code).await?;

        let move_successful = room.handle_move(client_id, &game_move.cards).await?;

        if !move_successful {
            return Ok(CommandResult::PlayerMoveInvalid);
        }

        self.event_emitter
            .emit_event(
                Topic::RoomService,
                Event::PlayerFoundSet(client_id, room_code.clone()),
            )
            .await?;

        if self.is_game_over(room_code).await? {
            self.event_emitter
                .emit_event(Topic::RoomService, Event::GameOver(room_code.clone()))
                .await?;
        }

        Ok(CommandResult::PlayerMoveValid)
    }

    async fn is_game_over(&self, room_code: &str) -> Result<bool, Error> {
        let room = self.get_room(room_code).await?;
        room.is_game_over().await
    }

    async fn get_room_game(&self, room_code: &str) -> Result<Arc<Mutex<Game>>, Error> {
        let room = self.get_room(room_code).await?;
        Ok(room.get_game_state().await)
    }

    pub async fn get_room(&self, room_code: &str) -> Result<Arc<Room>, Error> {
        let rooms = self.rooms.lock().await;
        match rooms.get(room_code) {
            Some(room) => Ok(room.clone()),
            None => Err(Error::RoomNotFound(format!("Room {} not found", room_code))),
        }
    }

    pub(super) async fn handle_request_cards(
        &self,
        client_id: u16,
        message: WsMessage,
    ) -> Result<CommandResult, Error> {
        let room_code = message.get_room_code()?;

        let room = self.get_room(&room_code).await?;
        room.request_cards(client_id).await?;

        self.event_emitter
            .emit_event(
                Topic::RoomService,
                Event::PlayerRequestedCards(client_id, room_code),
            )
            .await?;

        Ok(CommandResult::CardsRequested)
    }

    pub async fn handle_leave(
        &self,
        client_id: u16,
        room_code: String,
    ) -> Result<CommandResult, Error> {
        let room = self.get_room(&room_code).await?;
        room.remove_player(client_id).await?;

        self.event_emitter
            .emit_event(
                Topic::RoomService,
                Event::PlayerLeft(client_id, room_code.clone()),
            )
            .await?;

        Ok(CommandResult::PlayerRemovedFromRoom(client_id, room_code))
    }

    pub async fn start_new_game(&self, mode: GameMode) -> Result<CommandResult, Error> {
        let room_code = self.generate_room_code();
        let game = Game::new(mode);
        let room = Room::new(game);

        let mut rooms = self.rooms.lock().await;
        rooms.insert(room_code.clone(), Arc::new(room));

        Ok(CommandResult::RoomCreated(room_code))
    }

    pub async fn broadcast_game_state(&self, room_code: String) -> Result<(), Error> {
        let game_arc = self.get_room_game(&room_code).await?;
        self.event_emitter
            .emit_command(
                Topic::ClientService,
                Command::BroadcastGameState(room_code, game_arc),
            )
            .await?;
        Ok(())
    }

    fn generate_room_code(&self) -> String {
        use rand::{distributions::Alphanumeric, thread_rng, Rng};
        thread_rng()
            .sample_iter(&Alphanumeric)
            .take(ROOM_CODE_LENGTH)
            .map(char::from)
            .collect()
    }
}

#[async_trait]
impl RoomServiceTrait for RoomService {
    async fn handle_join(
        &self,
        message: WsMessage,
        client_id: u16,
    ) -> Result<CommandResult, Error> {
        self.handle_join(message, client_id).await
    }

    async fn handle_player_move(
        &self,
        client_id: u16,
        message: WsMessage,
    ) -> Result<CommandResult, Error> {
        self.handle_player_move(client_id, message).await
    }

    async fn get_room(&self, room_code: &str) -> Result<Arc<Room>, Error> {
        self.get_room(room_code).await
    }

    async fn handle_request_cards(
        &self,
        client_id: u16,
        message: WsMessage,
    ) -> Result<CommandResult, Error> {
        self.handle_request_cards(client_id, message).await
    }

    async fn handle_leave(
        &self,
        client_id: u16,
        room_code: String,
    ) -> Result<CommandResult, Error> {
        self.handle_leave(client_id, room_code).await
    }

    async fn start_new_game(&self, mode: GameMode) -> Result<CommandResult, Error> {
        self.start_new_game(mode).await
    }

    async fn broadcast_game_state(&self, room_code: String) -> Result<(), Error> {
        self.broadcast_game_state(room_code).await
    }
}
