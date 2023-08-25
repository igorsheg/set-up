use std::collections::HashMap;

use uuid::Uuid;

use crate::{
    client::ClientManager,
    game::{game::Game, player::Player},
    infra::error::Error,
    message::WsMessage,
};

pub struct RoomManager {
    rooms: HashMap<String, Game>,
}

impl RoomManager {
    pub fn new() -> Self {
        Self {
            rooms: HashMap::new(),
        }
    }

    pub fn add_room(&mut self, name: String, game: Game) {
        self.rooms.insert(name, game);
    }

    pub fn remove_room(&mut self, name: &str) {
        self.rooms.remove(name);
    }

    pub fn get_game_state(&self, room_code: &str) -> Result<&Game, Error> {
        if let Some(game_state) = self.rooms.get(room_code) {
            Ok(game_state)
        } else {
            Err(Error::GameError("Game not found".to_string()))
        }
    }

    pub async fn handle_join(
        &mut self,
        message: WsMessage,
        client_id: Uuid,
        client_manager: &mut ClientManager,
    ) -> Result<(), Error> {
        let room_code = message
            .payload
            .get("room_code")
            .and_then(|v| v.as_str())
            .unwrap_or_default()
            .to_string();

        log::debug!("Client {} joining room {}", client_id, room_code);

        if let Some(game) = self.rooms.get_mut(&room_code) {
            if let Ok(client) = client_manager.find_client(client_id) {
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

        self.broadcast_game_state(&message, client_manager).await?;

        Ok(())
    }

    pub async fn broadcast_game_state(
        &self,
        message: &WsMessage,
        client_manager: &mut ClientManager,
    ) -> Result<(), Error> {
        let room_code = message
            .payload
            .get("room_code")
            .and_then(|v| v.as_str())
            .unwrap_or_default()
            .to_string();

        let game_state = self.get_game_state(&room_code)?;
        let clients_in_room = client_manager.get_clients_in_room(&room_code);

        for client in clients_in_room {
            client_manager
                .send_message(game_state, client.id)
                .await
                .map_err(|err| {
                    Error::WebsocketError("Failed to send message to client".to_string())
                })?;
            // ... send game_state to client ...
        }

        Ok(())
    }
}
