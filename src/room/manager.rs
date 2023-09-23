use std::sync::Arc;

use ahash::{HashMap, HashMapExt};
use rand::{distributions::Alphanumeric, thread_rng, Rng};
use serde_json::json;
use tokio::sync::Mutex;

use crate::{
    client::ClientManager,
    game,
    game::{
        game::{Event, Game, GameMode, Move},
        player::Player,
    },
    infra::{ba, error::Error},
    message::WsMessage,
};

pub struct RoomManager {
    rooms: Mutex<HashMap<String, Arc<Mutex<Game>>>>,
}

impl Default for RoomManager {
    fn default() -> Self {
        Self::new()
    }
}

impl RoomManager {
    pub fn new() -> Self {
        Self {
            rooms: Mutex::new(HashMap::new()),
        }
    }

    pub async fn add_room(&self, name: String, game: Game) -> Result<(), Error> {
        let mut rooms = self.rooms.lock().await;
        let game = Arc::new(Mutex::new(game));
        rooms.insert(name.clone(), game);
        tracing::info!(room_name = %name, "New room added.");
        Ok(())
    }

    pub async fn remove_room(&self, name: &str) -> Result<(), Error> {
        let mut rooms = self.rooms.lock().await;
        rooms.remove(name);
        Ok(())
    }

    pub async fn get_game_state(&self, room_code: &str) -> Result<Arc<Mutex<Game>>, Error> {
        let rooms = self.rooms.lock().await;
        if let Some(game_state) = rooms.get(room_code) {
            Ok(game_state.clone())
        } else {
            Err(Error::GameError("Game not found".to_string()))
        }
    }

    pub async fn handle_join(
        &self,
        message: WsMessage,
        client_id: u16,
        client_manager: &ClientManager,
    ) -> Result<(), Error> {
        let room_code = message.get_room_code()?;
        let game_state_arc = self.get_game_state(&room_code).await?;
        let mut game_state = game_state_arc.lock().await;
        let client_arc = client_manager.find_client(client_id).await?;

        {
            let mut client = client_arc.lock().await;

            if game_state.restore_player(client_id).is_err() {
                let player_username = message.get_player_username()?;
                let player = Player::new(client.id, player_username);
                game_state.add_player(player.clone());

                tracing::info!(
                event_type = %ba::EventType::PlayerRejoined,
                client_id = %client_id,
                player_name = %player.name,
                );
            }

            tracing::info!(
            event_type = %ba::EventType::PlayerJoined,
            room_code = %room_code,
            client_id = %client_id,
            );

            client.set_room_code(room_code);
        }

        client_manager
            .broadcast_game_state(&message, &game_state)
            .await?;

        Ok(())
    }

    pub async fn handle_leave(
        &self,
        client_id: u16,
        client_manager: &ClientManager,
    ) -> Result<(), Error> {
        let client_arc = client_manager.find_client(client_id).await?;
        let room_code = {
            let client = client_arc.lock().await;
            client.get_room_code()?.clone()
        };

        let game_state_arc = self.get_game_state(&room_code).await?;
        let mut game_state = game_state_arc.lock().await;
        game_state.remove_player(client_id);

        let message = WsMessage::new_update_message(&room_code);
        client_manager
            .broadcast_game_state(&message, &game_state)
            .await?;

        Ok(())
    }

    pub async fn handle_move(
        &self,
        message: WsMessage,
        client_id: u16,
        client_manager: &ClientManager,
    ) -> Result<(), Error> {
        let game_move: Move = message.get_payload_as()?;

        let game_state_arc = self.get_game_state(&game_move.room_code).await?;
        let mut game_state = game_state_arc.lock().await;

        let move_result = game_state.make_move(client_id, game_move.cards.clone())?;

        let event_type = if move_result {
            ba::EventType::PlayerMoveValid
        } else {
            ba::EventType::PlayerMoveInvalid
        };

        tracing::info!(event_type = %event_type, room_code = %game_move.room_code, client_id = %client_id, cards = %json!(game_move.cards));

        if game_state.game_over.is_some() {
            tracing::info!(
            event_type = %ba::EventType::GameOver,
            room_code = %game_move.room_code,
            client_id = %client_id,
            );
        }

        client_manager
            .broadcast_game_state(&message, &game_state)
            .await?;

        Ok(())
    }

    pub async fn handle_request(
        &self,
        message: WsMessage,
        client_id: u16,
        client_manager: &ClientManager,
    ) -> Result<(), Error> {
        let room_code = message.get_room_code()?;
        let game_state_arc = self.get_game_state(&room_code).await?;
        let mut game_state = game_state_arc.lock().await;

        if let Some(player) = game_state
            .players
            .iter_mut()
            .find(|p| p.client_id == client_id)
        {
            player.request = true;
            let player_name = player.name.clone();
            game_state.events.push(Event::new(
                game::game::EventType::PlayerJoined,
                player_name.clone(),
            ));

            tracing::info!(
                event_type = %ba::EventType::PlayerRequestedCards,
                room_code = %room_code,
                client_id = %client_id,
                player_name = %player_name
            );
        } else {
            return Err(Error::ClientNotFound("Client not found".to_string()));
        }

        let all_requested = game_state.players.iter().all(|player| player.request);

        if all_requested && !game_state.deck.cards.is_empty() {
            game_state.add_cards();
            for player in game_state.players.iter_mut() {
                player.request = false; // Reset the request flags
            }
        }

        client_manager
            .broadcast_game_state(&message, &game_state)
            .await?;

        Ok(())
    }

    pub async fn handle_new(&self, mode: GameMode) -> Result<String, Error> {
        // let room_code = nanoid::nanoid!(6);

        let room_code: String = thread_rng()
            .sample_iter(&Alphanumeric)
            .take(6)
            .map(char::from)
            .collect();

        let mut game = Game::new(mode);
        for player in &mut game.players {
            player.score = 0;
        }

        let mut rooms = self.rooms.lock().await;
        rooms.insert(room_code.clone(), Arc::new(Mutex::new(game)));

        Ok(room_code)
    }

    pub async fn reset_game(
        &self,
        message: WsMessage,
        client_manager: &ClientManager,
    ) -> Result<(), Error> {
        let room_code = message.get_room_code()?;
        let game_state_arc = self.get_game_state(&room_code).await?;
        let mut game_state = game_state_arc.lock().await;

        game_state.reset();
        let message = WsMessage::new_update_message(&room_code);
        client_manager
            .broadcast_game_state(&message, &game_state)
            .await?;
        Ok(())
    }
}
