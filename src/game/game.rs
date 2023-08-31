use std::collections::HashMap;
use std::fmt;
use std::str::FromStr;
use std::time::SystemTime;
use std::time::UNIX_EPOCH;

use crate::game::deck::Deck;
use crate::game::player::Player;
use crate::infra::error::Error;
use serde::Deserialize;
use serde::Serialize;
use uuid::Uuid;

use super::card::Card;

const BEST_OF_3_SCORE: i64 = 3;

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum GameMode {
    Classic,
    BestOf3,
}

impl FromStr for GameMode {
    type Err = &'static str;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "classic" => Ok(GameMode::Classic),
            "bestof3" => Ok(GameMode::BestOf3),
            _ => Err("Invalid game mode"),
        }
    }
}

impl fmt::Display for GameMode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let string_representation = match self {
            GameMode::Classic => "classic",
            GameMode::BestOf3 => "bestof3",
        };
        write!(f, "{}", string_representation)
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct Game {
    pub deck: Deck,                  // The deck of cards
    pub game_over: Option<bool>,     // Indicates whether the game is over
    pub in_play: Vec<Card>,          // The cards currently in play, organized in rows
    pub last_player: Option<String>, // The last player who made a move
    pub last_set: Option<Vec<Card>>, // The last set of cards played
    pub players: Vec<Player>,        // The players in the game
    pub remaining: i64,              // The number of remaining cards in the deck
    pub state: GameState,
    pub mode: GameMode,
    pub disconnected_players: HashMap<Uuid, (u64, Player)>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub enum GameState {
    WaitingForPlayers,
    InProgress,
    Ended,
}

impl Default for Game {
    fn default() -> Self {
        Self::new(GameMode::Classic)
    }
}

impl Game {
    pub fn new(mode: GameMode) -> Self {
        let mut game = Game {
            deck: Deck::new(),
            game_over: None,
            in_play: vec![],
            last_player: None,
            last_set: None,
            players: vec![],
            remaining: 0,
            state: GameState::WaitingForPlayers,
            mode,
            disconnected_players: HashMap::new(),
        };
        game.deck.shuffle();
        game.deal();
        game
    }

    pub fn add_player(&mut self, player: Player) {
        self.players.push(player);
    }

    pub fn remove_player(&mut self, client_id: Uuid) -> bool {
        let start = SystemTime::now();
        let since_the_epoch = start
            .duration_since(UNIX_EPOCH)
            .expect("Since epoch error, Time went backwards");
        let timestamp = since_the_epoch.as_secs();

        if let Some(index) = self.players.iter().position(|p| p.client_id == client_id) {
            let player = self.players.remove(index);
            self.disconnected_players
                .insert(client_id, (timestamp, player));
            true
        } else {
            false
        }
    }

    pub fn restore_player(&mut self, client_id: Uuid) -> Result<(), &'static str> {
        if let Some((timestamp, player)) = self.disconnected_players.remove(&client_id) {
            let current_time = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("Time went backwards")
                .as_secs();

            if current_time - timestamp < 5 * 60 {
                log::info!("Player {} found, restoring...", player.clone().name);
                self.players.push(player);
                return Ok(());
            } else {
                // TODO: Remove player from game
            }
        }
        Err("Could not restore player")
    }

    pub fn deal(&mut self) {
        let mut in_play = Vec::with_capacity(6);
        for _ in 0..9 {
            if let Some(card) = self.deck.draw() {
                in_play.push(card);
            }
        }

        self.in_play = in_play;
        self.remaining = self.deck.cards.len() as i64;
    }

    pub fn make_move(&mut self, player_id: Uuid, selected_cards: Vec<Card>) -> Result<bool, Error> {
        let (valid, err) = self.check_set(&selected_cards);

        log::debug!("Valid: {:?}, Error: {:?}", valid, err);

        if !valid || err.is_some() {
            self.update_score(player_id, -1);
            return Err(Error::GameRuleError("Invalid set".to_string()));
        }

        let indices: Vec<usize> = selected_cards
            .iter()
            .filter_map(|v| self.find_index(v))
            .collect();

        let in_play_count = self
            .in_play
            .iter()
            .filter(|c| Some(c.color).is_some())
            .count();

        for index in indices {
            if !self.deck.cards.is_empty() && in_play_count < 15 {
                self.in_play[index] = self.deck.draw().unwrap();
            } else {
                self.in_play[index] = Card::new(); // Placeholder card
            }
        }

        self.update_score(player_id, 1);

        self.last_player = self
            .players
            .iter()
            .find(|p| p.client_id == player_id)
            .map(|p| p.name.clone());
        self.last_set = Some(selected_cards);

        self.remaining = self.deck.cards.len() as i64;

        if self.mode == GameMode::Classic {
            if self.deck.cards.is_empty() && self.check_remaining_sets() {
                log::info!("Game over in Classic mode!");
                self.state = GameState::Ended;
                self.game_over = Some(true);
            }
        } else if self.mode == GameMode::BestOf3
            && self.players.iter().any(|p| p.score >= BEST_OF_3_SCORE)
        {
            log::info!("Game over in BestOf3 mode!");
            self.state = GameState::Ended;
            self.game_over = Some(true);
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
        for i in 0..self.in_play.len() {
            for j in (i + 1)..self.in_play.len() {
                for k in (j + 1)..self.in_play.len() {
                    if self
                        .check_set(&[
                            self.in_play[i].clone(),
                            self.in_play[j].clone(),
                            self.in_play[k].clone(),
                        ])
                        .0
                    {
                        return false;
                    }
                }
            }
        }

        true
    }

    pub fn add_cards(&mut self) {
        let mut cards = self.deck.cards.drain(0..3).collect::<Vec<_>>();
        self.in_play.append(&mut cards);
        self.remaining = self.deck.cards.len() as i64;
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

    pub fn find_index(&self, card: &Card) -> Option<usize> {
        self.in_play.iter().position(|c| c == card)
    }
}

#[derive(Debug, Deserialize)]
pub struct Move {
    pub room_code: String,
    pub cards: Vec<Card>,
}
