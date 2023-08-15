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
            MessageType::Request(message) => self.handle_request(message, client_id).await,
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
                if let Some(name) = message
                    .payload
                    .get("player_username")
                    .and_then(|v| v.as_str())
                {
                    let player = Player::new(client.id, name.to_string());
                    game.add_player(player);
                    // client
                    //     .send_message(self.rooms.get(&room_code).unwrap().clone())
                    //     .await?;

                    for client in self.clients.values() {
                        client.send_message(game.clone()).await?;
                    }
                }
            } else {
                return Err(Error::GameError("Client not found".to_string()));
            }
        } else {
            return Err(Error::GameError("Game not found".to_string()));
        }

        Ok("ok".to_string())
    }

    pub async fn handle_move(
        &mut self,
        message: WsMessage,
        client_id: Uuid,
    ) -> Result<String, Error> {
        let payload_value = serde_json::Value::Object(message.payload.into_iter().collect());
        let game_move: Move = serde_json::from_value(payload_value)
            .map_err(|_| Error::GameError("Failed to parse move".to_string()))?;

        log::debug!("Player {:?} making move {:?}", client_id, game_move);

        // Find the game associated with the room code
        if let Some(game) = self.rooms.get_mut(&game_move.room_code) {
            // Apply the move to the game state
            game.make_move(client_id, game_move.cards)?;

            log::debug!("Client {} ", client_id);

            for client in self.clients.values() {
                client.send_message(game.clone()).await?;
            }
        } else {
            return Err(Error::GameError("Game not found".to_string()));
        }

        Ok("ok".to_string())
    }

    pub async fn handle_request(
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

        log::debug!("Client {} requesting more cards", client_id);

        if let Some(game) = self.rooms.get_mut(&room_code) {
            // Set the request flag for the player who sent the request
            log::info!("Game is true: {:?}", game.players);
            for player in game.players.iter_mut() {
                log::info!(
                    "Comparing player.client_id: {:?} with client_id: {:?}",
                    player,
                    client_id
                );
                if player.client_id == client_id {
                    log::info!("Player set to true: {:?}", player);
                    player.request = true;
                }
            }

            log::debug!("Game players: {:?}", game.players);

            // Check if all players have requested more cards
            let request = game.players.iter().all(|player| player.request);

            // If all players have requested and there are cards in the deck, add more cards
            if request && !game.deck.cards.is_empty() {
                game.add_cards();
                for player in game.players.iter_mut() {
                    player.request = false; // Reset the request flags
                }
                if let Some(client) = self.clients.get(&client_id) {
                    client.send_message(game.clone()).await?;
                }
            }
        }

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
