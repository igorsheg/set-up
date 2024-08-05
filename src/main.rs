use std::sync::Arc;

use crate::config::Configuration;
use application::{
    client::service::ClientService, game::service::GameService, room::service::RoomService,
};
use domain::events::Topic;
use infra::{error::Error, event_emmiter::EventEmitter, server::Server};
use tracing_subscriber::EnvFilter;

pub mod application;
pub mod config;
pub mod domain;
pub mod infra;
pub mod presentation;

#[cfg(feature = "loki")]
use tracing_loki::url::Url;

#[tokio::main]
async fn main() -> Result<(), Error> {
    let config = Configuration::new();
    let filter = EnvFilter::from_default_env();

    #[cfg(feature = "loki")]
    let loki_url = std::env::var("LOKI_URL")?;

    #[cfg(feature = "loki")]
    let (loki_tracing_layer, loki_tracing_task) = tracing_loki::builder()
        .label("host", "set-up-rust")?
        .build_url(Url::parse(&loki_url).unwrap())?;

    #[cfg(feature = "loki")]
    let subscriber = tracing_subscriber::fmt()
        .with_env_filter(filter)
        .with_ansi(true)
        .pretty()
        .json()
        .compact()
        .finish()
        .with(loki_tracing_layer);

    #[cfg(not(feature = "loki"))]
    let subscriber = tracing_subscriber::fmt()
        .with_env_filter(filter)
        .with_ansi(true)
        .pretty()
        .json()
        .compact()
        .finish();

    tracing::subscriber::set_global_default(subscriber).expect("Setting global default failed");

    let event_emitter = Arc::new(EventEmitter::new());
    let room_service = RoomService::new(event_emitter.clone());
    let client_service = ClientService::new(event_emitter.clone());

    let _ = event_emitter
        .register_listener(room_service.clone(), Topic::RoomService)
        .await;
    let _ = event_emitter
        .register_listener(client_service.clone(), Topic::ClientService)
        .await;

    let game_controller =
        GameService::<ClientService, RoomService>::new(client_service, room_service, event_emitter);

    let server = Server::new(
        config.server.host,
        config.server.port.parse().unwrap(),
        config.is_production,
        game_controller,
    );

    #[cfg(feature = "loki")]
    tokio::spawn(loki_tracing_task);

    server.run().await;
    Ok(())
}
