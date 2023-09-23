use std::time::SystemTime;

use serde::Serialize;
use strum::{Display, EnumString};

#[derive(Debug, Clone, Serialize, EnumString, Display)]
pub enum EventType {
    // Room-related events
    RoomCreated,
    RoomDestroyed,
    RoomReset,

    // Player-related events
    PlayerJoined,
    PlayerLeft,
    PlayerRejoined,
    PlayerRequestedCards,

    // Game-related events
    GameStarted,
    GamePaused,
    GameResumed,
    GameOver,
    GameReset,

    // Move-related events
    PlayerMoved,
    PlayerMoveValid,
    PlayerMoveInvalid,

    // Score-related events
    PlayerScoreUpdated,

    // Error-related events
    ClientError,
    ServerError,

    UnknownEvent,
}

#[derive(Debug, Clone, Serialize)]
pub struct Event {
    event_type: EventType,
    client_id: Option<u16>,
    room_code: Option<String>,
    additional_data: Option<serde_json::Value>,
    timestamp: SystemTime,
}

impl Event {
    pub fn new(
        event_type: EventType,
        client_id: Option<u16>,
        room_code: Option<String>,
        additional_data: Option<serde_json::Value>,
    ) -> Self {
        Self {
            event_type,
            client_id,
            room_code,
            additional_data,
            timestamp: SystemTime::now(),
        }
    }
}
