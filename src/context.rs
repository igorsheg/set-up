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
    ) -> Result<(), Error> {
        match message_type {
            MessageType::Join(message) => self.handle_join(message, client_id).await,
            MessageType::Move(message) => self.handle_move(message, client_id).await,
            MessageType::Request(message) => self.handle_request(message, client_id).await,
            MessageType::New => self.handle_new(client_id).await,
            MessageType::Leave => self.handle_leave(client_id).await,
        }
    }

    pub async fn handle_join(&mut self, message: WsMessage, client_id: Uuid) -> Result<(), Error> {
        let room_code = message
            .payload
            .get("room_code")
            .and_then(|v| v.as_str())
            .unwrap_or_default()
            .to_string();

        log::debug!("Client {} joining room {}", client_id, room_code);

        if let Some(game) = self.rooms.get_mut(&room_code) {
            if let Some(client) = self.clients.get_mut(&client_id) {
                client.room_code = Some(room_code.clone());
                if let Some(name) = message
                    .payload
                    .get("player_username")
                    .and_then(|v| v.as_str())
                {
                    let player = Player::new(client.id, name.to_string());
                    game.add_player(player);
                }
            } else {
                return Err(Error::GameError("Client not found".to_string()));
            }
        } else {
            return Err(Error::GameError("Game not found".to_string()));
        }

        self.broadcast_game_state(&message).await?;

        Ok(())
    }

    pub async fn handle_leave(&mut self, client_id: Uuid) -> Result<(), Error> {
        if let Some(client) = self.clients.get_mut(&client_id) {
            if let Some(room_code) = &client.room_code {
                if let Some(game) = self.rooms.get_mut(room_code) {
                    game.remove_player(client_id);
                }

                let message = WsMessage {
                    r#type: "update".to_string(),
                    payload: {
                        let mut payload = HashMap::new();
                        payload.insert(
                            "room_code".to_string(),
                            serde_json::Value::String(room_code.clone()),
                        );
                        payload
                    },
                };

                self.broadcast_game_state(&message).await?;
            }
        }

        Ok(())
    }

    pub async fn handle_move(&mut self, message: WsMessage, client_id: Uuid) -> Result<(), Error> {
        let payload_value = serde_json::Value::Object(message.payload.into_iter().collect());
        let game_move: Move = serde_json::from_value(payload_value)
            .map_err(|_| Error::GameError("Failed to parse move".to_string()))?;

        log::debug!("Player {:?} making move {:?}", client_id, game_move);

        if let Some(game) = self.rooms.get_mut(&game_move.room_code) {
            game.make_move(client_id, game_move.cards)?;

            log::debug!("Client {} ", client_id);

            for client in self.clients.values() {
                client.send_message(game.clone()).await?;
            }
        } else {
            return Err(Error::GameError("Game not found".to_string()));
        }

        Ok(())
    }

    pub async fn handle_request(
        &mut self,
        message: WsMessage,
        client_id: Uuid,
    ) -> Result<(), Error> {
        let room_code = message
            .payload
            .get("room_code")
            .and_then(|v| v.as_str())
            .unwrap_or_default()
            .to_string();

        log::debug!("Client {} requesting more cards", client_id);

        if let Some(game) = self.rooms.get_mut(&room_code) {
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

            let request = game.players.iter().all(|player| player.request);

            if request && !game.deck.cards.is_empty() {
                game.add_cards();
                for player in game.players.iter_mut() {
                    player.request = false; // Reset the request flags
                }
            }
        }

        self.broadcast_game_state(&message).await?;

        Ok(())
    }

    pub async fn handle_new(&mut self, client_id: Uuid) -> Result<(), Error> {
        let room_code = nanoid::nanoid!(6);

        let mut game = Game::new();
        let mut players = game.players.clone();
        for player in &mut players {
            player.score = 0;
        }
        game.players = players;

        self.rooms.insert(room_code.clone(), game.clone());

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

        Ok(())
    }

    pub async fn broadcast_game_state(&self, message: &WsMessage) -> Result<(), Error> {
        let room_code = message
            .payload
            .get("room_code")
            .and_then(|v| v.as_str())
            .unwrap_or_default()
            .to_string();

        if let Some(game) = self.rooms.get(&room_code) {
            for client in self.clients.values() {
                if client.room_code.as_ref() == Some(&room_code) {
                    client.send_message(game.clone()).await?;
                }
            }
        } else {
            return Err(Error::GameError("Game not found".to_string()));
        }

        Ok(())
    }
}
