use crate::{
    domain::events::{AppEvent, Command, CommandResult, Event},
    infra::event_emmiter::{EventEmitterError, EventListener},
};
use thiserror::Error;
use tracing::{error, info, warn};

use super::service::RoomService;

#[derive(Error, Debug)]
pub enum RoomServiceError {
    #[error("Failed to handle join: {0}")]
    JoinError(String),
    #[error("Failed to handle player move: {0}")]
    MoveError(String),
    #[error("Failed to handle request cards: {0}")]
    RequestCardsError(String),
    #[error("Failed to create room: {0}")]
    CreateRoomError(String),
    #[error("Failed to broadcast game state: {0}")]
    BroadcastError(String),
    #[error("Failed to handle player leave: {0}")]
    LeaveError(String),
    #[error("Failed to send command result: {0}")]
    SendResultError(String),
}

impl From<RoomServiceError> for EventEmitterError {
    fn from(error: RoomServiceError) -> Self {
        EventEmitterError::SendError(error.to_string())
    }
}

impl RoomService {
    pub async fn handle_command(
        &self,
        command: Command,
    ) -> Result<CommandResult, RoomServiceError> {
        match command {
            Command::CreateRoom(mode) => self.start_new_game(mode).await.map_err(|e| {
                RoomServiceError::CreateRoomError(format!("Failed to create room: {:?}", e))
            }),
            Command::RequestPlayerJoin(client_id, message) => {
                self.handle_join(message, client_id).await.map_err(|e| {
                    RoomServiceError::JoinError(format!(
                        "Failed to handle join for client {}: {:?}",
                        client_id, e
                    ))
                })
            }
            Command::PlayerMove(client_id, message) => self
                .handle_player_move(client_id, message)
                .await
                .map_err(|e| {
                    RoomServiceError::MoveError(format!(
                        "Failed to handle move for client {}: {:?}",
                        client_id, e
                    ))
                }),
            Command::RequestCards(client_id, message) => self
                .handle_request_cards(client_id, message)
                .await
                .map_err(|e| {
                    RoomServiceError::RequestCardsError(format!(
                        "Failed to handle request cards for client {}: {:?}",
                        client_id, e
                    ))
                }),
            _ => Ok(CommandResult::NotHandled),
        }
    }
}

#[async_trait::async_trait]
impl EventListener for RoomService {
    async fn handle_event(&self, event: AppEvent) -> Result<(), EventEmitterError> {
        match event {
            AppEvent::EventOccurred(e) => self.handle_event_occurred(e).await?,
            AppEvent::CommandReceived(command, result_sender) => {
                self.handle_received_command(command, result_sender).await?
            }
        }
        Ok(())
    }
}

impl RoomService {
    async fn handle_event_occurred(&self, event: Event) -> Result<(), RoomServiceError> {
        match event {
            Event::PlayerJoinedRoom(_client_id, ref room_code)
            | Event::PlayerFoundSet(_client_id, ref room_code)
            | Event::PlayerRequestedCards(_client_id, ref room_code)
            | Event::PlayerLeft(_client_id, ref room_code)
            | Event::GameOver(_client_id, ref room_code) => {
                self.broadcast_game_state(room_code.clone())
                    .await
                    .map_err(|e| {
                        RoomServiceError::BroadcastError(format!(
                            "Failed to broadcast game state for room {}: {:?}",
                            room_code, e
                        ))
                    })?;
                info!(
                    "Broadcasted game state for room {} after event: {:?}",
                    room_code, event
                );
                Ok(())
            }
            Event::ClientRemoved(client_id, room_code) => {
                if let Some(code) = room_code {
                    self.handle_leave(client_id, code.clone())
                        .await
                        .map_err(|e| {
                            RoomServiceError::LeaveError(format!(
                                "Failed to handle leave for client {} in room {}: {:?}",
                                client_id, code, e
                            ))
                        })?;
                    info!("Handled leave for client {} in room {}", client_id, code);
                }
                Ok(())
            }
            _ => {
                warn!("Unhandled event: {:?}", event);
                Ok(())
            }
        }
    }

    async fn handle_received_command(
        &self,
        command: Command,
        result_sender: tokio::sync::mpsc::Sender<CommandResult>,
    ) -> Result<(), RoomServiceError> {
        let result = self.handle_command(command).await?;
        result_sender.send(result).await.map_err(|e| {
            RoomServiceError::SendResultError(format!("Failed to send command result: {:?}", e))
        })?;
        Ok(())
    }
}

