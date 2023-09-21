use std::sync::Arc;

use crate::{
    client::ClientManager,
    game::game::GameMode,
    infra::{ba::AnalyticsObserver, error::Error},
    message::MessageType,
    room::RoomManager,
};
use uuid::Uuid;

pub struct Context {
    client_manager: ClientManager,
    room_manager: RoomManager,
    analytics_observer: Arc<dyn AnalyticsObserver>, // Add this line
}

impl Context {
    pub fn new(analytics_observer: Arc<dyn AnalyticsObserver>) -> Self {
        Self {
            client_manager: ClientManager::new(),
            room_manager: RoomManager::new(),
            analytics_observer,
        }
    }

    pub fn client_manager(&self) -> &ClientManager {
        &self.client_manager
    }

    pub fn room_manager(&self) -> &RoomManager {
        &self.room_manager
    }

    pub async fn new_room(&mut self, mode: GameMode) -> Result<String, Error> {
        self.room_manager.handle_new(mode).await
    }

    pub async fn handle_message(
        &self,
        message_type: MessageType,
        client_id: Uuid,
        room_manager: &RoomManager,
        client_manager: &ClientManager,
    ) -> Result<(), Error> {
        match message_type {
            MessageType::Join(message) => {
                room_manager
                    .handle_join(&self.analytics_observer, message, client_id, client_manager)
                    .await
            }
            MessageType::Move(message) => {
                room_manager
                    .handle_move(&self.analytics_observer, message, client_id, client_manager)
                    .await
            }
            MessageType::Request(message) => {
                room_manager
                    .handle_request(&self.analytics_observer, message, client_id, client_manager)
                    .await
            }
            MessageType::Ping => Ok(()),
            MessageType::Leave => room_manager.handle_leave(client_id, client_manager).await,
            MessageType::Reset(message) => room_manager.reset_game(message, client_manager).await,
        }
    }
}
