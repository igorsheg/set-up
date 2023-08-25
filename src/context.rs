use uuid::Uuid;

use crate::{client::ClientManager, infra::error::Error, message::MessageType, room::RoomManager};

pub struct Context {
    client_manager: ClientManager,
    room_manager: RoomManager,
}

impl Context {
    pub fn new() -> Self {
        Self {
            client_manager: ClientManager::new(),
            room_manager: RoomManager::new(),
        }
    }

    pub fn client_manager(&self) -> &ClientManager {
        &self.client_manager
    }

    pub fn room_manager(&self) -> &RoomManager {
        &self.room_manager
    }

    pub async fn handle_message(
        &mut self,
        message_type: MessageType,
        client_id: Uuid,
    ) -> Result<(), Error> {
        match message_type {
            MessageType::Join(message) => {
                self.client_manager
                    .handle_join(message, client_id, &mut self.room_manager)
                    .await
            }
            MessageType::Move(message) => self.room_manager.handle_move(message, client_id).await,
            MessageType::Request(message) => {
                self.room_manager.handle_request(message, client_id).await
            }
            MessageType::New => self.room_manager.handle_new().await,
            MessageType::Leave => {
                self.client_manager
                    .handle_leave(client_id, &mut self.room_manager)
                    .await
            }
        }
    }
}
