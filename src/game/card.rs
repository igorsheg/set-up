use rand::Rng;
use serde::{de, Deserialize, Deserializer, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Shape {
    Diamond = 0,
    Oval = 1,
    Squiggle = 2,
}

impl Serialize for Shape {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_i64(*self as i64)
    }
}

impl<'de> Deserialize<'de> for Shape {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let number: i64 = Deserialize::deserialize(deserializer)?;
        match number {
            0 => Ok(Shape::Diamond),
            1 => Ok(Shape::Oval),
            2 => Ok(Shape::Squiggle),
            _ => Err(de::Error::custom("Invalid shape value")),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Color {
    Red = 0,
    Purple = 1,
    Green = 2,
}

impl Serialize for Color {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_i64(*self as i64)
    }
}

impl<'de> Deserialize<'de> for Color {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let number: i64 = Deserialize::deserialize(deserializer)?;
        match number {
            0 => Ok(Color::Red),
            1 => Ok(Color::Purple),
            2 => Ok(Color::Green),
            _ => Err(de::Error::custom("Invalid shape value")),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Number {
    One = 0,
    Two = 1,
    Three = 2,
}

impl Serialize for Number {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_i64(*self as i64)
    }
}

impl<'de> Deserialize<'de> for Number {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let number: i64 = Deserialize::deserialize(deserializer)?;
        match number {
            0 => Ok(Number::One),
            1 => Ok(Number::Two),
            2 => Ok(Number::Three),
            _ => Err(de::Error::custom("Invalid shape value")),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Shading {
    Outlined = 0,
    Striped = 1,
    Solid = 2,
}

impl Serialize for Shading {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_i64(*self as i64)
    }
}

impl<'de> Deserialize<'de> for Shading {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let number: i64 = Deserialize::deserialize(deserializer)?;
        match number {
            0 => Ok(Shading::Outlined),
            1 => Ok(Shading::Striped),
            2 => Ok(Shading::Solid),
            _ => Err(de::Error::custom("Invalid shape value")),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Card {
    pub shape: Shape,
    pub color: Color,
    pub number: Number,
    pub shading: Shading,
}

impl Default for Card {
    fn default() -> Self {
        Self::new()
    }
}

impl Card {
    pub fn new() -> Self {
        let mut rng = rand::thread_rng();

        let shape = match rng.gen_range(0..3) {
            0 => Shape::Diamond,
            1 => Shape::Oval,
            2 => Shape::Squiggle,
            _ => unreachable!(),
        };

        let color = match rng.gen_range(0..3) {
            0 => Color::Red,
            1 => Color::Purple,
            2 => Color::Green,
            _ => unreachable!(),
        };

        let number = match rng.gen_range(0..3) {
            0 => Number::One,
            1 => Number::Two,
            2 => Number::Three,
            _ => unreachable!(),
        };

        let shading = match rng.gen_range(0..3) {
            0 => Shading::Outlined,
            1 => Shading::Striped,
            2 => Shading::Solid,
            _ => unreachable!(),
        };

        Self {
            shape,
            color,
            number,
            shading,
        }
    }
}
