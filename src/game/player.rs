use serde::Serialize;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize)]
pub struct Player {
    pub client_id: Uuid,
    pub name: String,
    pub score: i64,
    pub request: bool,
}

impl Player {
    pub fn new(client_id: Uuid, name: String) -> Self {
        Player {
            client_id,
            name,
            score: 0,
            request: false,
        }
    }
}
