use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize)]
#[repr(i64)]
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

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize)]
#[repr(i64)]
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

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize)]
#[repr(i64)]
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

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize)]
#[repr(i64)]
pub enum Shading {
    Outlined = 0,
    Striped,
    Solid,
}

impl Serialize for Shading {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_i64(*self as i64)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Card {
    pub shape: Shape,
    pub color: Color,
    pub number: Number,
    pub shading: Shading,
}
