use std::sync::Arc;

use ahash::{HashMap, HashMapExt};
use async_trait::async_trait;
use serde_json::json;
use tokio::sync::{broadcast, Mutex};

use crate::{
    domain::{
        events::{AppEvent, Command, CommandResult, Event, Topic},
        game::{
            self,
            game::{Game, GameMode, Move},
            player::Player,
        },
        message::WsMessage,
        room::Room,
    },
    infra::{
        ba,
        error::Error,
        event_emmiter::{EventEmitter, EventListener},
    },
};

const ROOM_CODE_LENGTH: usize = 6;

pub struct RoomService {
    rooms: Mutex<HashMap<String, Arc<Room>>>,
    event_emitter: EventEmitter,
}

impl RoomService {
    pub fn new(event_emitter: EventEmitter) -> Self {
        Self {
            rooms: Mutex::new(HashMap::new()),
            event_emitter,
        }
    }

    pub async fn handle_command(&self, command: Command) -> Result<CommandResult, Error> {
        match command {
            Command::CreateRoom(mode) => self.start_new_game(mode).await,
            Command::RequestPlayerJoin(client_id, message) => {
                self.handle_join(message, client_id).await
            }
            Command::PlayerMove(client_id, message) => {
                self.handle_player_move(client_id, message).await
            }
            Command::RequestCards(client_id, message) => {
                self.handle_request_cards(client_id, message).await
            }
            Command::RemovePlayerFromRoom(client_id, room_code) => {
                self.handle_leave(client_id, room_code).await
            }
            _ => Ok(CommandResult::NotHandled),
        }
    }

    pub async fn handle_join(
        &self,
        message: WsMessage,
        client_id: u16,
    ) -> Result<CommandResult, Error> {
        let room_code = message.get_room_code()?;
        let game_state_arc = self.get_game_state(&room_code).await?;
        let mut game_state = game_state_arc.lock().await;

        if game_state.restore_player(client_id).is_err() {
            let player_username = message.get_player_username()?;
            let player = Player::new(client_id, player_username);
            game_state.add_player(player.clone());
        }

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
        let game_state_arc = self.get_game_state(&game_move.room_code).await?;
        let mut game_state = game_state_arc.lock().await;

        let move_result = game_state.make_move(client_id, game_move.cards.clone())?;

        let event_type = if move_result {
            ba::EventType::PlayerMoveValid
        } else {
            ba::EventType::PlayerMoveInvalid
        };

        tracing::info!(
            event_type = %event_type,
            room_code = %game_move.room_code,
            client_id = %client_id,
            cards = %json!(game_move.cards)
        );

        if !move_result {
            return Ok(CommandResult::PlayerMoveInvalid);
        }

        if game_state.game_over.is_some() {
            tracing::info!(
                event_type = %ba::EventType::GameOver,
                room_code = %game_move.room_code,
                client_id = %client_id,
            );
        }

        self.event_emitter
            .emit_command(
                Topic::ClientService,
                Command::BroadcastGameState(game_move.room_code, game_state.clone()),
            )
            .await?;

        Ok(CommandResult::PlayerMoveValid)
    }

    async fn handle_request_cards(
        &self,
        client_id: u16,
        message: WsMessage,
    ) -> Result<CommandResult, Error> {
        let room_code = message.get_room_code()?;
        let game_state_arc = self.get_game_state(&room_code).await?;
        let mut game_state = game_state_arc.lock().await;

        if let Some(player) = game_state
            .players
            .iter_mut()
            .find(|p| p.client_id == client_id)
        {
            player.request = true;
            let player_name = player.name.clone();
            game_state.events.push(game::game::Event::new(
                game::game::EventType::PlayerRequestedCards,
                player_name.clone(),
            ));

            tracing::info!(
                event_type = %ba::EventType::PlayerRequestedCards,
                room_code = %room_code,
                client_id = %client_id,
                player_name = %player_name
            );

            let all_requested = game_state.players.iter().all(|player| player.request);
            if all_requested && !game_state.deck.cards.is_empty() {
                game_state.add_cards();
                for player in game_state.players.iter_mut() {
                    player.request = false; // Reset the request flags
                }
            }

            self.event_emitter
                .emit_command(
                    Topic::ClientService,
                    Command::BroadcastGameState(room_code.clone(), game_state.clone()),
                )
                .await?;

            Ok(CommandResult::CardsRequested)
        } else {
            Err(Error::ClientNotFound("Client not found".to_string()))
        }
    }

    pub async fn handle_leave(
        &self,
        client_id: u16,
        room_code: String,
    ) -> Result<CommandResult, Error> {
        tracing::info!("Player left ----> {}", client_id);
        let game_state_arc = self.get_game_state(&room_code).await?;
        let mut game_state = game_state_arc.lock().await;
        game_state.remove_player(client_id);

        self.event_emitter
            .emit_app_event(
                Topic::ClientService,
                AppEvent::EventOccurred(Event::PlayerLeft(client_id, room_code.clone())),
            )
            .await?;

        Ok(CommandResult::PlayerRemovedFromRoom(client_id, room_code))
    }

    pub async fn get_game_state(&self, room_code: &str) -> Result<Arc<Mutex<Game>>, Error> {
        let rooms = self.rooms.lock().await;
        match rooms.get(room_code) {
            Some(room) => Ok(room.get_game_state().await),
            None => Err(Error::RoomNotFound(format!("Room {} not found", room_code))),
        }
    }

    pub async fn start_new_game(&self, mode: GameMode) -> Result<CommandResult, Error> {
        let room_code = self.generate_room_code();
        let game = Game::new(mode);
        let room = Room::new(game);

        let mut rooms = self.rooms.lock().await;
        rooms.insert(room_code.clone(), Arc::new(room));

        tracing::info!("New game started in room: {}", room_code);
        Ok(CommandResult::RoomCreated(room_code))
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
impl EventListener for RoomService {
    async fn get_event_receiver(&self) -> broadcast::Receiver<AppEvent> {
        self.event_emitter.subscribe(Topic::RoomService).await
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
        let broadcast_game_state = |room_code: String, game_state: Game| async move {
            self.event_emitter
                .emit_command(
                    Topic::ClientService,
                    Command::BroadcastGameState(room_code, game_state),
                )
                .await
        };

        tracing::info!("Event occurred: {:?}", event);
        match event {
            Event::PlayerJoinedRoom(_client_id, room_code) => {
                let game_state_arc = self.get_game_state(&room_code).await?;
                let game_state = game_state_arc.lock().await;
                // broadcast_game_state(room_code, game_state).await?;
                self.event_emitter
                    .emit_command(
                        Topic::ClientService,
                        Command::BroadcastGameState(room_code.clone(), game_state.clone()),
                    )
                    .await?;
                Ok(())
            }

            Event::PlayerLeft(_client_id, room_code) => {
                let game_state_arc = self.get_game_state(&room_code).await?;
                let game_state = game_state_arc.lock().await.clone();
                broadcast_game_state(room_code, game_state).await?;
                Ok(())
            }

            _ => {
                tracing::debug!("Event not handled: {:?}", event);
                Ok(())
            }
        }
    }

    async fn handle_received_command(
        &self,
        command: Command,
        result_sender: tokio::sync::mpsc::Sender<CommandResult>,
    ) -> Result<(), Error> {
        let result = self.handle_command(command).await?;
        result_sender.send(result).await?;
        Ok(())
    }
}
