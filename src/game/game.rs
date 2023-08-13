use std::collections::HashMap;

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

    pub fn make_move(&mut self, player_id: Uuid, selected_cards: Vec<Card>) -> Result<bool, Error> {
        let (valid, err) = self.check_set(&selected_cards);

        log::debug!("Valid: {:?}, Error: {:?}", valid, err);

        if !valid || err.is_some() {
            self.update_score(player_id, -1);
            return Err(Error::GameError("Invalid set".to_string()));
        }

        // Find the location of the 3 cards in the in_play matrix
        let indices: Vec<(usize, usize)> = selected_cards
            .iter()
            .filter_map(|v| self.find_index(v))
            .collect();

        // Sum the cards in play, ignoring the placeholder ones
        let in_play_count = self
            .in_play
            .iter()
            .flatten()
            .filter(|c| Some(c.color).is_some())
            .count();

        // Replace the found set with new cards if there are fewer than 15 cards in play
        for (i, j) in indices {
            if !self.deck.cards.is_empty() && in_play_count < 15 {
                self.in_play[i][j] = self.deck.draw().unwrap();
            } else {
                self.in_play[i][j] = Card::new(); // Placeholder card
            }
        }

        // Give the player a point
        self.update_score(player_id, 1);

        // Update the last player and last set
        self.last_player = self
            .players
            .iter()
            .find(|p| p.client_id == player_id)
            .map(|p| p.name.clone());
        self.last_set = Some(selected_cards);

        // Update the remaining count
        self.remaining = self.deck.cards.len() as i64;

        // If there are no cards left, check if there are any remaining sets on the board
        if self.deck.cards.is_empty() {
            return Ok(self.check_remaining_sets());
        }

        Ok(false)
    }

    pub fn check_set(&self, cards: &[Card]) -> (bool, Option<Error>) {
        if cards.len() != 3 {
            return (
                false,
                Some(Error::GameError("Sets must contain 3 cards".to_string())),
            );
        }

        let mut colors = HashMap::new();
        let mut shapes = HashMap::new();
        let mut numbers = HashMap::new();
        let mut shadings = HashMap::new();

        for card in cards {
            *colors.entry(card.color).or_insert(0) += 1;
            *shapes.entry(card.shape).or_insert(0) += 1;
            *numbers.entry(card.number).or_insert(0) += 1;
            *shadings.entry(card.shading).or_insert(0) += 1;
        }

        if colors.values().any(|&v| v == 2)
            || shapes.values().any(|&v| v == 2)
            || numbers.values().any(|&v| v == 2)
            || shadings.values().any(|&v| v == 2)
        {
            return (false, None);
        }

        (true, None)
    }

    pub fn check_remaining_sets(&self) -> bool {
        let mut cards: Vec<Card> = Vec::new();
        for row in &self.in_play {
            for card in row {
                if Some(card.color).is_some() {
                    cards.push(card.clone());
                }
            }
        }

        for i in 0..cards.len() {
            for j in (i + 1)..cards.len() {
                for k in (j + 1)..cards.len() {
                    if self
                        .check_set(&[cards[i].clone(), cards[j].clone(), cards[k].clone()])
                        .0
                    {
                        return false;
                    }
                }
            }
        }

        true
    }

    pub fn update_score(&mut self, player_id: Uuid, value: i64) {
        let player = self.players.iter_mut().find(|p| p.client_id == player_id);
        if let Some(player) = player {
            if player.score == 0 && value < 0 {
                return;
            }
            player.score += value;
        }
    }

    pub fn find_index(&self, card: &Card) -> Option<(usize, usize)> {
        for i in 0..self.in_play.len() {
            for j in 0..self.in_play[i].len() {
                if &self.in_play[i][j] == card {
                    return Some((i, j));
                }
            }
        }
        None
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
    pub room_code: String,
    pub cards: Vec<Card>,
}
