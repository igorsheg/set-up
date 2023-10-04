use std::sync::Arc;

use tokio::sync::RwLock;

use super::game::{
    card::Card,
    game::{Event, Game},
    player::Player,
};
use crate::infra::error::Error;

pub struct Room {
    game: Arc<RwLock<Game>>,
}

impl Room {
    pub fn new(game: Game) -> Self {
        Self {
            game: Arc::new(RwLock::new(game)),
        }
    }

    pub async fn reset_game(&self) -> Result<(), Error> {
        let mut game_state = self.game.write().await;
        game_state.reset();
        Ok(())
    }

    pub async fn handle_move(&self, client_id: u16, cards: &[Card]) -> Result<bool, Error> {
        let mut game_state = self.game.write().await;
        let result = game_state.make_move(client_id, cards)?;
        if result {
            Ok(true)
        } else {
            Ok(false)
        }
    }

    pub async fn is_game_over(&self) -> Result<bool, Error> {
        let game_state = self.game.read().await;
        Ok(game_state.game_over.is_some())
    }

    pub async fn remove_player(&self, client_id: u16) -> Result<(), Error> {
        let mut game_state = self.game.write().await;
        game_state.remove_player(client_id);
        Ok(())
    }

    pub async fn get_game_state(&self) -> Arc<RwLock<Game>> {
        self.game.clone()
    }

    pub async fn join_player(&self, client_id: u16, player_username: String) -> Result<(), Error> {
        let mut game_state = self.game.write().await;

        if game_state.restore_player(client_id).is_err() {
            let player = Player::new(client_id, player_username);
            game_state.add_player(player);
        }

        Ok(())
    }

    pub async fn request_cards(&self, client_id: u16) -> Result<(), Error> {
        let mut game_state = self.game.write().await;

        if let Some(player) = game_state
            .players
            .iter_mut()
            .find(|p| p.client_id == client_id)
        {
            player.request = true;
            let player_name = player.name.clone();
            game_state.events.push(Event::new(
                super::game::game::EventType::PlayerRequestedCards,
                player_name,
            ));

            let all_requested = game_state.players.iter().all(|player| player.request);
            if all_requested && !game_state.deck.cards.is_empty() {
                game_state.add_cards();
                for player in game_state.players.iter_mut() {
                    player.request = false; // Reset the request flags
                }
            }
            Ok(())
        } else {
            Err(Error::PlayerNotFound(client_id.to_string()))
        }
    }
}
