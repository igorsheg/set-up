#[allow(clippy::module_inception)]
pub mod client;
pub mod manager;

pub use client::Client;
pub use manager::ClientManager;
