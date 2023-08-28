use serde::Serialize;

use super::card::{Card, Color, Number, Shading, Shape};

#[derive(Debug, Clone, Serialize)]
pub struct Deck {
    pub cards: Vec<Card>,
}

impl Default for Deck {
    fn default() -> Self {
        Self::new()
    }
}

impl Deck {
    pub fn new() -> Self {
        let mut cards = Vec::new();
        for &shape in &[Shape::Diamond, Shape::Oval, Shape::Squiggle] {
            for &color in &[Color::Red, Color::Purple, Color::Green] {
                for &number in &[Number::One, Number::Two, Number::Three] {
                    for &shading in &[Shading::Outlined, Shading::Striped, Shading::Solid] {
                        cards.push(Card {
                            shape,
                            color,
                            number,
                            shading,
                        });
                    }
                }
            }
        }
        Self { cards }
    }

    pub fn shuffle(&mut self) {
        use rand::seq::SliceRandom;
        let mut rng = rand::thread_rng();
        self.cards.shuffle(&mut rng);
    }

    pub fn draw(&mut self) -> Option<Card> {
        self.cards.pop()
    }
}
