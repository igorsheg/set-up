use std::sync::Arc;

use tokio::sync::Mutex;

use super::game::game::{Event, Game, Move};
use crate::infra::error::Error;

pub struct Room {
    game: Arc<Mutex<Game>>,
}

impl Room {
    pub fn new(game: Game) -> Self {
        Self {
            game: Arc::new(Mutex::new(game)),
        }
    }

    pub async fn get_game_state(&self) -> Arc<Mutex<Game>> {
        self.game.clone()
    }

    pub async fn reset_game(&self) -> Result<(), Error> {
        let mut game_state = self.game.lock().await;
        game_state.reset();
        Ok(())
    }

    pub async fn handle_move(&self, client_id: u16, game_move: Move) -> Result<(), Error> {
        let mut game_state = self.game.lock().await;
        game_state.make_move(client_id, game_move.cards.clone())?;
        Ok(())
    }

    pub async fn handle_request(&self, client_id: u16) -> Result<(), Error> {
        let mut game_state = self.game.lock().await;
        if let Some(player) = game_state
            .players
            .iter_mut()
            .find(|p| p.client_id == client_id)
        {
            player.request = true;
            let player_name = player.name.clone();
            game_state.events.push(Event::new(
                super::game::game::EventType::PlayerRequestedCards,
                player_name.clone(),
            ));
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
        Ok(())
    }

    // If you have other methods manipulating game state, you can also move them here.
}
