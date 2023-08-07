use crate::domain::card::entity::Card;
use rand::prelude::*;
use rand::rngs::StdRng;

#[derive(Debug, Clone, PartialEq)]
pub struct Stock {
    seed: u64,
    rng: StdRng,
}

impl Stock {
    pub fn from_seed(seed: u64) -> Self {
        let rng = StdRng::seed_from_u64(seed);
        Self { seed, rng }
    }
}

impl Iterator for Stock {
    type Item = Card;

    fn next(&mut self) -> Option<Self::Item> {
        Some(self.rng.gen())
    }
}
