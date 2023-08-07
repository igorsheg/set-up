use rand::{seq::SliceRandom, Rng};

use super::entity::{Color, Number, Shading, Symbol};

pub trait SampleEnum: 'static + Sized + Copy {
    const VARIANTS: &'static [Self];

    fn sample<R: Rng + ?Sized>(rng: &mut R) -> Self {
        Self::VARIANTS.choose(rng).unwrap().clone()
    }
}

impl SampleEnum for Number {
    const VARIANTS: &'static [Self] = &[Number::One, Number::Two, Number::Three];
}

impl SampleEnum for Color {
    const VARIANTS: &'static [Self] = &[Color::Blue, Color::Pink, Color::Yellow];
}

impl SampleEnum for Shading {
    const VARIANTS: &'static [Shading] = &[Shading::Open, Shading::Solid, Shading::Stripe];
}

impl SampleEnum for Symbol {
    const VARIANTS: &'static [Symbol] = &[Symbol::Circle, Symbol::Square, Symbol::Triangle];
}
