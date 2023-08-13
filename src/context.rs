use std::collections::HashMap;

use uuid::Uuid;

use crate::{
    client::Client,
    game::{
        game::{Game, Move},
        player::Player,
    },
    infra::error::Error,
    message::{MessageType, WsMessage},
};

#[derive(Debug)]
pub struct Context {
    pub clients: HashMap<Uuid, Client>,
    pub rooms: HashMap<String, Game>,
}

impl Default for Context {
    fn default() -> Self {
        Self::new()
    }
}

impl Context {
    pub fn new() -> Self {
        Self {
            clients: HashMap::new(),
            rooms: HashMap::new(),
        }
    }

    pub async fn handle_message(
        &mut self,
        message_type: MessageType,
        client_id: Uuid,
    ) -> Result<String, Error> {
        match message_type {
            MessageType::Join(message) => self.handle_join(message, client_id).await,
            MessageType::Move(message) => self.handle_move(message, client_id).await,
            MessageType::Request => self.handle_request(),
            MessageType::New => self.handle_new(client_id).await,
        }
    }

    pub async fn handle_join(
        &mut self,
        message: WsMessage,
        client_id: Uuid,
    ) -> Result<String, Error> {
        let room_code = message
            .payload
            .get("room_code")
            .and_then(|v| v.as_str())
            .unwrap_or_default()
            .to_string();
        log::debug!("Client {} joining room {}", client_id, room_code);

        if let Some(game) = self.rooms.get_mut(&room_code) {
            if let Some(client) = self.clients.get(&client_id) {
                if let Some(name) = message.payload.get("name").and_then(|v| v.as_str()) {
                    let player = Player::new(client.id, name.to_string());
                    game.add_player(player);
                    client
                        .send_message(self.rooms.get(&room_code).unwrap().clone())
                        .await?;
                }
            } else {
                return Err(Error::GameError("Client not found".to_string()));
            }
        } else {
            return Err(Error::GameError("Game not found".to_string()));
        }

        log::debug!(
            "Rooms: {:?}",
            self.rooms
                .clone()
                .into_iter()
                .map(|(k, v)| (k, v.players))
                .collect::<HashMap<String, Vec<Player>>>()
        );

        Ok("ok".to_string())
    }

    pub async fn handle_move(
        &mut self,
        message: WsMessage,
        client_id: Uuid,
    ) -> Result<String, Error> {
        let room_code = message
            .payload
            .get("room_code")
            .and_then(|v| v.as_str())
            .unwrap_or_default()
            .to_string();
        let game_move_json = message
            .payload
            .get("move")
            .ok_or(Error::GameError("Move not found".to_string()))?;

        // Deserialize the game_move
        let game_move: Move = serde_json::from_value(game_move_json.clone())
            .map_err(|_| Error::GameError("Failed to parse move".to_string()))?;

        // Find the game associated with the room code
        if let Some(game) = self.rooms.get_mut(&room_code) {
            // Apply the move to the game state
            game.make_move(client_id, game_move.cards)?;
        } else {
            return Err(Error::GameError("Game not found".to_string()));
        }

        Ok("ok".to_string())
    }

    pub fn handle_request(&mut self) -> Result<String, Error> {
        // Handle a generic request (e.g., requesting game state)
        // You may want to implement specific logic here based on your requirements
        Ok("ok".to_string())
    }

    pub async fn handle_new(&mut self, client_id: Uuid) -> Result<String, Error> {
        // Generate a unique room code
        let room_code = nanoid::nanoid!(6);

        // Create a new game instance
        let mut game = Game::new();
        let mut players = game.players.clone();
        for player in &mut players {
            player.score = 0;
        }
        game.players = players;

        // Add the game to the rooms
        self.rooms.insert(room_code.clone(), game.clone());

        // Optionally, notify the client of the room code
        if let Some(client) = self.clients.get(&client_id) {
            client.send_message(game.clone()).await?;
        }

        log::debug!(
            "Rooms: {:?}",
            self.rooms
                .clone()
                .into_iter()
                .map(|(k, v)| (k, v.players))
                .collect::<HashMap<String, Vec<Player>>>()
        );

        Ok(room_code)
    }
}
