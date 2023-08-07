use std::sync::Arc;

use tokio::sync::Mutex;

use crate::config::Configuration;

#[macro_use]
extern crate log;

pub mod application;
pub mod config;
pub mod domain;
pub mod presentation;

#[tokio::main]
async fn main() -> std::io::Result<()> {
    let config = Configuration::new();
    env_logger::init();

    let game_session_service = Arc::new(Mutex::new(
        application::services::game::GameSessionService::new(),
    ));

    let services = presentation::http_server::Services {
        game_session: game_session_service,
    };

    let server = presentation::http_server::Server::new(
        config.server.host,
        config.server.port.parse().unwrap(),
        services,
    );

    server.run().await;

    Ok(())
}
