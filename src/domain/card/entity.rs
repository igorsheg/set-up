use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Eq, Clone, Copy, Hash, Serialize, Deserialize)]
pub enum Color {
    Blue,
    Pink,
    Yellow,
}

#[derive(Debug, PartialEq, Eq, Clone, Copy, Hash, Serialize, Deserialize)]
pub enum Number {
    One,
    Two,
    Three,
}

#[derive(Debug, PartialEq, Eq, Clone, Copy, Hash, Serialize, Deserialize)]
pub enum Shading {
    Open,
    Solid,
    Stripe,
}

#[derive(Debug, PartialEq, Eq, Clone, Copy, Hash, Serialize, Deserialize)]
pub enum Symbol {
    Circle,
    Square,
    Triangle,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Card {
    pub color: Color,
    pub number: Number,
    pub shading: Shading,
    pub symbol: Symbol,
}
