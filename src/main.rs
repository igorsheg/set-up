use server::Server;

use crate::config::Configuration;

extern crate log;

pub mod client;
pub mod config;
pub mod context;
pub mod game;
pub mod infra;
pub mod message;
pub mod room;
pub mod server;

#[tokio::main]
async fn main() -> std::io::Result<()> {
    let config = Configuration::new();
    env_logger::init();

    let server = Server::new(
        config.server.host,
        config.server.port.parse().unwrap(),
        config.is_production,
    );

    server.run().await;

    Ok(())
}
