use async_trait::async_trait;
use tokio::sync::broadcast;

use super::service::RoomService;
use crate::{
    domain::events::{AppEvent, Command, CommandResult, Event, Topic},
    infra::{error::Error, event_emmiter::EventListener},
};

impl RoomService {
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
        match event {
            Event::PlayerJoinedRoom(_client_id, room_code)
            | Event::PlayerFoundSet(_client_id, room_code)
            | Event::PlayerRequestedCards(_client_id, room_code)
            | Event::PlayerLeft(_client_id, room_code) => {
                self.broadcast_game_state(room_code).await
            }
            Event::GameOver(room_code) => self.broadcast_game_state(room_code).await,

            _ => {
                tracing::warn!("Event not handled: {:?}", event);
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
