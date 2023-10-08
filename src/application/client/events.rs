use async_trait::async_trait;
use tokio::sync::broadcast;

use super::service::ClientService;
use crate::{
    domain::events::{AppEvent, Command, CommandResult, Event, Topic},
    infra::{error::Error, event_emmiter::EventListener},
};

impl ClientService {
    async fn handle_command(&self, command: Command) -> Result<CommandResult, Error> {
        match command {
            Command::BroadcastGameState(room_code, game_state) => {
                self.broadcast_game_state(room_code, game_state).await
            }
            Command::SetClientRoomCode(client_id, room_code) => {
                self.join_room(client_id, room_code).await
            }
            _ => Ok(CommandResult::NotHandled),
        }
    }
}

#[async_trait]
impl EventListener for ClientService {
    async fn get_event_receiver(&self) -> Result<broadcast::Receiver<AppEvent>, Error> {
        Ok(self.event_emitter.subscribe(Topic::ClientService).await?)
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
            Event::ClientDisconnected(client_id) => {
                self.remove_client(client_id).await?;
                Ok(())
            }
            Event::ClientConnected(client_id, tx) => {
                self.setup_or_update_client(client_id, tx).await?;
                Ok(())
            }
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
        let _ = result_sender.send(result).await;
        Ok(())
    }
}
