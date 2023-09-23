use crate::{
    client::ClientManager, game::game::GameMode, infra::error::Error, message::MessageType,
    room::RoomManager,
};

pub struct Context {
    client_manager: ClientManager,
    room_manager: RoomManager,
}

impl Default for Context {
    fn default() -> Self {
        Self::new()
    }
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

    pub async fn new_room(&mut self, mode: GameMode) -> Result<String, Error> {
        self.room_manager.handle_new(mode).await
    }

    pub async fn handle_message(
        &self,
        message_type: MessageType,
        client_id: u16,
        room_manager: &RoomManager,
        client_manager: &ClientManager,
    ) -> Result<(), Error> {
        match message_type {
            MessageType::Join(message) => {
                room_manager
                    .handle_join(message, client_id, client_manager)
                    .await
            }
            MessageType::Move(message) => {
                room_manager
                    .handle_move(message, client_id, client_manager)
                    .await
            }
            MessageType::Request(message) => {
                room_manager
                    .handle_request(message, client_id, client_manager)
                    .await
            }
            MessageType::Ping => Ok(()),
            MessageType::Leave => room_manager.handle_leave(client_id, client_manager).await,
            MessageType::Reset(message) => room_manager.reset_game(message, client_manager).await,
        }
    }
}
