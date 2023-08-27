use std::collections::HashMap;

use uuid::Uuid;

use crate::{
    client::ClientManager,
    game::{
        game::{Game, Move},
        player::Player,
    },
    infra::error::Error,
    message::WsMessage,
};

pub struct RoomManager {
    rooms: HashMap<String, Game>,
}

impl Default for RoomManager {
    fn default() -> Self {
        Self::new()
    }
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

    pub fn get_game_state(&mut self, room_code: &str) -> Result<&mut Game, Error> {
        if let Some(game_state) = self.rooms.get_mut(room_code) {
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
        let room_code = message.get_room_code()?;
        let game_state = self.get_game_state(&room_code)?;
        let client = client_manager.find_client(client_id)?;
        let player_username = message.get_player_username()?;
        let player = Player::new(client.id, player_username);

        client.set_room_code(room_code);
        game_state.add_player(player);

        client_manager.broadcast_game_state(&message, self).await?;

        Ok(())
    }

    pub async fn handle_leave(
        &mut self,
        client_id: Uuid,
        client_manager: &mut ClientManager,
    ) -> Result<(), Error> {
        let client = client_manager.find_client(client_id)?;
        let room_code = client.get_room_code()?;
        let game_state = self.get_game_state(room_code)?;

        game_state.remove_player(client_id);

        let message = WsMessage::new_update_message(room_code);
        client_manager.broadcast_game_state(&message, self).await?;

        Ok(())
    }

    pub async fn handle_move(
        &mut self,
        message: WsMessage,
        client_id: Uuid,
        client_manager: &mut ClientManager,
    ) -> Result<(), Error> {
        let game_move: Move = message.get_payload_as()?;

        let game_state = self.get_game_state(&game_move.room_code)?;
        game_state.make_move(client_id, game_move.cards)?;

        client_manager.broadcast_game_state(&message, self).await?;

        Ok(())
    }

    pub async fn handle_request(
        &mut self,
        message: WsMessage,
        client_id: Uuid,
        client_manager: &mut ClientManager,
    ) -> Result<(), Error> {
        let room_code = message.get_room_code()?;
        let game_state = self.get_game_state(&room_code)?;

        for player in game_state.players.iter_mut() {
            if player.client_id == client_id {
                player.request = true;
            }
        }
        let request = game_state.players.iter().all(|player| player.request);

        if request && !game_state.deck.cards.is_empty() {
            game_state.add_cards();
            for player in game_state.players.iter_mut() {
                player.request = false; // Reset the request flags
            }
        }

        client_manager.broadcast_game_state(&message, self).await?;

        Ok(())
    }

    pub async fn handle_new(&mut self) -> Result<String, Error> {
        let room_code = nanoid::nanoid!(6);

        let mut game = Game::new();
        let mut players = game.players.clone();
        for player in &mut players {
            player.score = 0;
        }
        game.players = players;

        self.rooms.insert(room_code.clone(), game);

        Ok(room_code)
    }
}
