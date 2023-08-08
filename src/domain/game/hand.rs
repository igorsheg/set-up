use super::{set::Set, stock::Stock};
use crate::domain::card::entity::Card;
use itertools::Itertools;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Hand {
    cards: Vec<Card>,
}

impl Hand {
    pub fn from_stock(stock: &Stock) -> (Stock, Self) {
        let mut stock = stock.clone();
        let mut cards = Vec::new();

        while !Self::is_valid(&cards) {
            cards = (0..12).flat_map(|_| stock.next()).collect();
        }

        (stock, Self { cards })
    }

    pub fn swap(&self, stock: &Stock, set: &Set) -> (Stock, Self) {
        let mut stock = stock.clone();
        let mut cards = Vec::new();

        while !(Self::is_valid(&cards) && Self::is_swap(&cards, set)) {
            cards = self
                .cards
                .clone()
                .into_iter()
                .flat_map(|card| {
                    if set.contains(card) {
                        stock.next()
                    } else {
                        Some(card)
                    }
                })
                .collect();
        }

        (stock, Self { cards })
    }

    pub fn cards(&self) -> Vec<Card> {
        self.cards.clone()
    }

    fn is_valid(cards: &[Card]) -> bool {
        cards.len() == 12
            && cards.iter().unique().collect_vec().len() == 12
            && cards
                .iter()
                .tuple_combinations()
                .any(|(a, b, c)| Set::try_from_cards(*a, *b, *c).is_ok())
    }

    fn is_swap(cards: &[Card], set: &Set) -> bool {
        !cards.iter().any(|&c| set.contains(c))
    }
}
