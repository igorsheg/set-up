use serde::Serialize;

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct Player {
    pub client_id: u16,
    pub name: String,
    pub score: i64,
    pub request: bool,
}

impl Player {
    pub fn new(client_id: u16, name: String) -> Self {
        Player {
            client_id,
            name,
            score: 0,
            request: false,
        }
    }
}
