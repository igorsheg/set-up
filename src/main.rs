use crate::config::Configuration;

#[macro_use]
extern crate log;

pub mod application;
pub mod config;
pub mod domain;
pub mod infra;
pub mod presentation;

#[tokio::main]
async fn main() -> std::io::Result<()> {
    let config = Configuration::new();
    env_logger::init();

    let server = presentation::http::server::Server::new(
        config.server.host,
        config.server.port.parse().unwrap(),
    );

    server.run().await;

    Ok(())
}
