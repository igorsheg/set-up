use crate::domain::card::{
    entity::{Card, Color, Number, Shading, Symbol},
    repository::SampleEnum,
};
use rand::{
    distributions::{Distribution, Standard},
    Rng,
};

impl Distribution<Color> for Standard {
    fn sample<R: Rng + ?Sized>(&self, rng: &mut R) -> Color {
        Color::sample(rng)
    }
}

impl Distribution<Number> for Standard {
    fn sample<R: Rng + ?Sized>(&self, rng: &mut R) -> Number {
        Number::sample(rng)
    }
}

impl Distribution<Shading> for Standard {
    fn sample<R: Rng + ?Sized>(&self, rng: &mut R) -> Shading {
        Shading::sample(rng)
    }
}
impl Distribution<Symbol> for Standard {
    fn sample<R: Rng + ?Sized>(&self, rng: &mut R) -> Symbol {
        Symbol::sample(rng)
    }
}

impl Card {
    pub fn new(color: Color, number: Number, shading: Shading, symbol: Symbol) -> Card {
        Card {
            color,
            number,
            shading,
            symbol,
        }
    }
    pub fn color(&self) -> Color {
        self.color
    }
    pub fn number(&self) -> Number {
        self.number
    }
    pub fn shading(&self) -> Shading {
        self.shading
    }
    pub fn symbol(&self) -> Symbol {
        self.symbol
    }
}

impl Distribution<Card> for Standard {
    fn sample<R: Rng + ?Sized>(&self, rng: &mut R) -> Card {
        Card::new(rng.gen(), rng.gen(), rng.gen(), rng.gen())
    }
}
