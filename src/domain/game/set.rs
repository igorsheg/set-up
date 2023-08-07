use std::collections::HashSet;

use crate::domain::card::entity::Card;

#[derive(Debug, Clone, PartialEq)]
pub struct Set(Card, Card, Card);

impl Set {
    pub fn try_from_cards(a: Card, b: Card, c: Card) -> Result<Self, String> {
        // You can use a custom Error type here if you have one
        fn validate_attribute<A: Eq + std::hash::Hash>(
            a: Card,
            b: Card,
            c: Card,
            get_attribute: fn(Card) -> A,
        ) -> Result<(), String> {
            // You can use a custom Error type here if you have one
            let count = vec![a, b, c]
                .into_iter()
                .map(get_attribute)
                .collect::<HashSet<A>>()
                .len();

            match count {
                2 => Err("Attribute is invalid".to_string()), // Customize this error message
                _ => Ok(()),
            }
        }

        // Update these calls with the correct attributes of your Card struct
        match (
            validate_attribute(a, b, c, |c| c.number()),
            validate_attribute(a, b, c, |c| c.color()),
            validate_attribute(a, b, c, |c| c.symbol()),
            validate_attribute(a, b, c, |c| c.shading()),
        ) {
            (Ok(()), Ok(()), Ok(()), Ok(())) => Ok(Set(a, b, c)),
            _ => Err("Cards do not form a valid set".to_string()), // Customize this error message
        }
    }

    pub fn contains(&self, card: Card) -> bool {
        [self.0, self.1, self.2].contains(&card)
    }
}
