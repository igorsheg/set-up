use crate::config::Configuration;

#[macro_use]
extern crate log;

pub mod client;
pub mod config;
pub mod context;
pub mod game;
pub mod infra;
pub mod message;
pub mod server;

#[tokio::main]
async fn main() -> std::io::Result<()> {
    let config = Configuration::new();
    env_logger::init();

    let server = server::Server::new(config.server.host, config.server.port.parse().unwrap());

    server.run().await;

    Ok(())
}
