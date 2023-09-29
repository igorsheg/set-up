use async_trait::async_trait;

use crate::events::{AppEvent, EventListener};

#[derive(Clone)]
pub struct Testy {}

impl Default for Testy {
    fn default() -> Self {
        Self::new()
    }
}

impl Testy {
    pub fn new() -> Self {
        Self {}
    }
}

#[async_trait]
impl EventListener for Testy {
    async fn handle_event(&self, event: AppEvent) {
        tracing::info!("Testy handling event: {:?}", event);
        println!("Before: RoomManager handling ClientConnected",);
        match event {
            AppEvent::PlayerJoined(client_id, _message) => {
                println!("RoomManager handling ClientConnected: {}", client_id);
                // Handle the event here
            }
            // Handle other events as needed
            _ => {
                println!("Other ----------->",);
            }
        }
    }
}
