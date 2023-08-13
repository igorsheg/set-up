use crate::game::deck::Deck;
use crate::game::player::Player;
use crate::infra::error::Error;
use serde::Deserialize;
use serde::Serialize;
use uuid::Uuid;

use super::card::Card;

#[derive(Debug, Clone, Serialize)]
pub struct Game {
    pub deck: Deck,                  // The deck of cards
    pub game_over: Option<bool>,     // Indicates whether the game is over
    pub in_play: Vec<Vec<Card>>,     // The cards currently in play, organized in rows
    pub last_player: Option<String>, // The last player who made a move
    pub last_set: Option<Vec<Card>>, // The last set of cards played
    pub players: Vec<Player>,        // The players in the game
    pub remaining: i64,              // The number of remaining cards in the deck
    pub state: GameState,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub enum GameState {
    WaitingForPlayers,
    InProgress,
    Ended,
}

impl Default for Game {
    fn default() -> Self {
        Self::new()
    }
}

impl Game {
    pub fn new() -> Self {
        let mut game = Game {
            deck: Deck::new(),
            game_over: None,
            in_play: vec![vec![], vec![], vec![]],
            last_player: None,
            last_set: None,
            players: vec![],
            remaining: 0,
            state: GameState::WaitingForPlayers,
        };
        game.deck.shuffle();
        game.deal(); // Call the deal method to initialize the in_play and remaining fields
        game
    }

    pub fn add_player(&mut self, player: Player) {
        self.players.push(player);
    }

    pub fn deal(&mut self) {
        // Initialize in_play as a vector of three empty vectors
        let mut in_play = vec![Vec::new(), Vec::new(), Vec::new()];

        // Iterate four times to deal 12 cards in total
        for _ in 0..4 {
            (0..3).for_each(|j| {
                // Take the top card from the deck and copy it to the corresponding row
                if let Some(card) = self.deck.draw() {
                    in_play[j].push(card);
                }
            });
        }

        // Update the InPlay and Remaining fields of the game
        self.in_play = in_play;
        self.remaining = self.deck.cards.len() as i64;
    }

    pub fn make_move(&mut self, player_id: Uuid, selected_cards: Vec<Card>) -> Result<(), Error> {
        // Validate the move and update the game state
        if self.state != GameState::InProgress {
            return Err(Error::GameError("Game is not in progress".to_string()));
        }

        if !self.is_valid_set(&selected_cards) {
            return Err(Error::GameError("Invalid set".to_string()));
        }

        // Apply the move
        self.apply_move(player_id, selected_cards);

        Ok(())
    }

    pub fn is_valid_set(&self, selected_cards: &[Card]) -> bool {
        // Check if the selected cards form a valid set according to the game's rules
        // Implement the validation logic here
        true
    }

    pub fn apply_move(&mut self, player_id: Uuid, selected_cards: Vec<Card>) {
        // Apply the player's move to the game state
        // Update scores, remove matched cards, draw new cards, etc.
    }

    // Additional game logic and methods can be implemented here
}

#[derive(Debug, Deserialize)]
pub struct Move {
    pub player_id: Option<i64>,
    pub cards: Vec<Card>,
}
