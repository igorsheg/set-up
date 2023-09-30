use async_trait::async_trait;

use super::{game::game::Game, message::WsMessage};

#[derive(Debug, Clone)]
pub enum AppEvent {
    PlayerJoined(u16, WsMessage),
    RequestPlayerJoin(u16, WsMessage),
    UpdateGameState(u16, String), // client_id, room_code
    BroadcastGameState(WsMessage, Game),
    SetClientRoomCode(u16, String),
}

#[async_trait]
pub trait EventHandler {
    async fn handle_event(&self, event: AppEvent);
}
