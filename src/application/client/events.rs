use crate::{
    domain::events::{AppEvent, Command, CommandResult, Event},
    infra::event_emmiter::{EventEmitterError, EventListener},
};
use thiserror::Error;
use tracing::{error, info, warn};

use super::service::ClientService;

#[derive(Error, Debug)]
pub enum ClientServiceError {
    #[error("Failed to remove client: {0}")]
    RemoveClientError(String),
    #[error("Failed to setup or update client: {0}")]
    SetupClientError(String),
    #[error("Command handling error: {0}")]
    CommandError(String),
    #[error("Failed to send command result: {0}")]
    SendResultError(String),
}

impl From<ClientServiceError> for EventEmitterError {
    fn from(error: ClientServiceError) -> Self {
        EventEmitterError::SendError(error.to_string())
    }
}

#[async_trait::async_trait]
impl EventListener for ClientService {
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

impl ClientService {
    async fn handle_event_occurred(&self, event: Event) -> Result<(), ClientServiceError> {
        match event {
            Event::ClientDisconnected(client_id) => {
                self.remove_client(client_id).await.map_err(|e| {
                    ClientServiceError::RemoveClientError(format!(
                        "Failed to remove client {}: {:?}",
                        client_id, e
                    ))
                })?;
                info!("Client {} disconnected", client_id);
            }
            Event::ClientConnected(client_id, tx) => {
                self.setup_or_update_client(client_id, tx)
                    .await
                    .map_err(|e| {
                        ClientServiceError::SetupClientError(format!(
                            "Failed to setup client {}: {:?}",
                            client_id, e
                        ))
                    })?;
                info!("Client {} connected", client_id);
            }
            _ => {
                warn!("Unhandled event: {:?}", event);
            }
        }
        Ok(())
    }

    async fn handle_received_command(
        &self,
        command: Command,
        result_sender: tokio::sync::mpsc::Sender<CommandResult>,
    ) -> Result<(), ClientServiceError> {
        let result = self.handle_command(command).await.map_err(|e| {
            ClientServiceError::CommandError(format!("Error handling command: {:?}", e))
        })?;

        result_sender.send(result).await.map_err(|e| {
            ClientServiceError::SendResultError(format!("Failed to send command result: {:?}", e))
        })?;

        Ok(())
    }

    async fn handle_command(&self, command: Command) -> Result<CommandResult, ClientServiceError> {
        match command {
            Command::BroadcastGameState(room_code, game_state) => self
                .broadcast_game_state(room_code, game_state)
                .await
                .map_err(|e| {
                    ClientServiceError::CommandError(format!(
                        "Failed to broadcast game state: {:?}",
                        e
                    ))
                }),
            Command::SetClientRoomCode(client_id, room_code) => {
                self.join_room(client_id, room_code).await.map_err(|e| {
                    ClientServiceError::CommandError(format!(
                        "Failed to set client room code: {:?}",
                        e
                    ))
                })
            }
            _ => Ok(CommandResult::NotHandled),
        }
    }
}

