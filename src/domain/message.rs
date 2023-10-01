use ahash::{HashMap, HashMapExt};
use serde::{de::DeserializeOwned, Deserialize, Serialize};

use crate::infra::error::Error;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WsMessage {
    pub r#type: String,
    pub payload: HashMap<String, serde_json::Value>,
}

impl WsMessage {
    pub fn get_room_code(&self) -> Result<String, Error> {
        self.payload
            .get("room_code")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .ok_or_else(|| Error::GameError("Missing or invalid room_code".to_string()))
    }
    pub fn get_player_username(&self) -> Result<String, Error> {
        self.payload
            .get("player_username")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .ok_or_else(|| Error::GameError("Missing or invalid player_username".to_string()))
    }
    pub fn new_update_message(room_code: &str) -> Self {
        let mut payload = HashMap::new();
        payload.insert(
            "room_code".to_string(),
            serde_json::Value::String(room_code.to_owned()),
        );

        WsMessage {
            r#type: "update".to_string(),
            payload,
        }
    }
    pub fn get_payload_as<T: DeserializeOwned>(&self) -> Result<T, Error> {
        let payload_value = serde_json::Value::Object(self.payload.clone().into_iter().collect());
        serde_json::from_value(payload_value)
            .map_err(|_| Error::GameError("Failed to parse payload".to_string()))
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JoinPayload {
    pub room_code: String,
}

#[derive(Debug)]
pub enum MessageType {
    Join(WsMessage),
    Move(WsMessage),
    Request(WsMessage),
    Ping,
    Leave,
    Reset(WsMessage),
}

impl MessageType {
    pub fn from_ws_message(message: WsMessage) -> Result<Self, Error> {
        match message.r#type.as_str() {
            "join" => Ok(MessageType::Join(message)),
            "move" => Ok(MessageType::Move(message)),
            "ping" => Ok(MessageType::Ping),
            "request" => Ok(MessageType::Request(message)),
            "reset" => Ok(MessageType::Reset(message)),

            _ => Err(Error::GameError(format!(
                "Unrecognized message type: {}",
                message.r#type
            ))),
        }
    }
}
