use serde::Serialize;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize)]
pub struct Player {
    pub client_id: Uuid,
    pub name: String,
    pub score: i32,
}

impl Player {
    pub fn new(client_id: Uuid, name: String) -> Self {
        Player {
            client_id,
            name, // Initialize player attributes
            score: 0,
        }
    }
}
