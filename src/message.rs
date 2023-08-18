use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::infra::error::Error;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WsMessage {
    pub r#type: String,
    pub payload: HashMap<String, serde_json::Value>,
}

pub enum MessageType {
    Join(WsMessage),
    Move(WsMessage),
    Request(WsMessage),
    New,
    Leave,
}

impl MessageType {
    pub fn from_ws_message(message: WsMessage) -> Result<Self, Error> {
        match message.r#type.as_str() {
            "join" => Ok(MessageType::Join(message)),
            "move" => Ok(MessageType::Move(message)),
            "request" => Ok(MessageType::Request(message)),
            "new" => Ok(MessageType::New),
            _ => Err(Error::GameError(format!(
                "Unrecognized message type: {}",
                message.r#type
            ))),
        }
    }
}
