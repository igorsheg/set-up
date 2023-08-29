use crate::{
    client::ClientManager, game::game::GameMode, infra::error::Error, message::MessageType,
    room::RoomManager,
};
use std::sync::Arc;
use tokio::sync::Mutex;
use uuid::Uuid;

pub struct Context {
    client_manager: Arc<Mutex<ClientManager>>,
    room_manager: Arc<Mutex<RoomManager>>,
}

impl Default for Context {
    fn default() -> Self {
        Self::new()
    }
}

impl Context {
    pub fn new() -> Self {
        Self {
            client_manager: Arc::new(Mutex::new(ClientManager::new())),
            room_manager: Arc::new(Mutex::new(RoomManager::new())),
        }
    }

    pub fn client_manager(&self) -> &Arc<Mutex<ClientManager>> {
        &self.client_manager
    }

    pub fn room_manager(&self) -> &Arc<Mutex<RoomManager>> {
        &self.room_manager
    }

    pub async fn new_room(&self, mode: GameMode) -> Result<String, Error> {
        let mut room_manager = self.room_manager.lock().await;
        let room_code = room_manager.handle_new(mode).await?;
        Ok(room_code)
    }

    pub async fn handle_message(
        &self,
        message_type: MessageType,
        client_id: Uuid,
    ) -> Result<(), Error> {
        let mut room_manager = self.room_manager.lock().await;
        let mut client_manager = self.client_manager.lock().await;
        match message_type {
            MessageType::Join(message) => {
                room_manager
                    .handle_join(message, client_id, &mut client_manager)
                    .await
            }
            MessageType::Move(message) => {
                room_manager
                    .handle_move(message, client_id, &mut client_manager)
                    .await
            }
            MessageType::Request(message) => {
                room_manager
                    .handle_request(message, client_id, &mut client_manager)
                    .await
            }
            // MessageType::New => {
            //     let _ = room_manager.handle_new().await;
            //     Ok(())
            // }
            MessageType::Leave => {
                room_manager
                    .handle_leave(client_id, &mut client_manager)
                    .await
            }
        }
    }
}
