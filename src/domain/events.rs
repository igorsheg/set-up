use async_trait::async_trait;

use super::message::WsMessage;

#[derive(Debug, Clone)]
pub enum AppEvent {
    PlayerJoined(u16, WsMessage),
}

#[async_trait]
pub trait EventHandler {
    async fn handle_event(&self, event: AppEvent);
}
