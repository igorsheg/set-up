use rand::seq::SliceRandom;
use rand::thread_rng;
use serde::Deserialize;

// Constants for colors, shapes, numbers, and shading
#[derive(Debug, Clone, Copy, Deserialize)]
enum Color {
    Red,
    Purple,
    Green,
}

#[derive(Debug, Clone, Copy, Deserialize)]
enum Shape {
    Diamond,
    Oval,
    Squiggle,
}

#[derive(Debug, Clone, Copy, Deserialize)]
enum Number {
    One,
    Two,
    Three,
}

#[derive(Debug, Clone, Copy, Deserialize)]
enum Shading {
    Outlined,
    Striped,
    Solid,
}

// Structure representing a card
#[derive(Debug, Clone, Deserialize)]
pub struct Card {
    color: Color,
    shape: Shape,
    number: Number,
    shading: Shading,
}

#[derive(Debug)]
pub struct Deck {
    cards: Vec<Card>,
}

impl Deck {
    // Create a new deck
    fn new() -> Self {
        let mut cards = Vec::new();
        for color in &[Color::Red, Color::Purple, Color::Green] {
            for shape in &[Shape::Diamond, Shape::Oval, Shape::Squiggle] {
                for number in &[Number::One, Number::Two, Number::Three] {
                    for shading in &[Shading::Outlined, Shading::Striped, Shading::Solid] {
                        cards.push(Card {
                            color: *color,
                            shape: *shape,
                            number: *number,
                            shading: *shading,
                        });
                    }
                }
            }
        }

        // Shuffle the deck
        let mut rng = thread_rng();
        cards.shuffle(&mut rng);

        Self { cards }
    }

    // Draw cards from the deck
    fn draw(&mut self, count: usize) -> Vec<Card> {
        self.cards.drain(0..count).collect()
    }
}

// Structure representing a player
#[derive(Debug, Clone)]
pub struct Player {
    pub id: i64,
    pub name: String,
    pub score: i64,
    pub request: bool,
}

// Structure representing a move
#[derive(Debug, Deserialize)]
pub struct Move {
    pub player_id: i64,
    pub cards: Vec<Card>,
}

#[derive(Debug)]
pub struct Game {
    pub deck: Deck,
    pub game_over: bool,
    pub in_play: Vec<Vec<Card>>,
    pub last_player: String,
    pub last_set: Vec<Card>,
    pub players: Vec<Player>,
    pub remaining: i64,
}

impl Game {
    // Create a new game
    pub fn new() -> Self {
        let deck = Deck::new();
        // Initialize other attributes as needed
        // ...

        Self {
            deck,
            game_over: false,
            in_play: Vec::new(),
            last_player: String::new(),
            last_set: Vec::new(),
            players: Vec::new(),
            remaining: 0, // Update as needed
        }
    }

    // Other game logic methods (play, request, etc.)
    // ...
}
