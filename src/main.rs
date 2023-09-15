use crate::config::Configuration;
use server::Server;
use tracing_subscriber::EnvFilter;

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

    let filter = EnvFilter::from_default_env();
    tracing_subscriber::fmt()
        .with_env_filter(filter)
        .with_ansi(true)
        .with_thread_ids(true)
        .compact()
        .with_target(true)
        .json()
        .init();

    let server = Server::new(
        config.server.host,
        config.server.port.parse().unwrap(),
        config.is_production,
    );

    server.run().await;

    Ok(())
}
