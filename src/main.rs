use std::sync::Arc;

use application::{client_service::ClientService, room_service::RoomService};
use infra::{
    error::Error,
    server::{AppState, Server},
};
use presentation::ws::event_emmiter::EventEmitter;
use tokio::sync::Mutex;
use tracing_loki::url::Url;
use tracing_subscriber::{prelude::*, EnvFilter};

use crate::config::Configuration;

pub mod application;
pub mod config;
// pub mod context;
pub mod domain;
pub mod infra;
// pub mod message;
// pub mod room;
pub mod presentation;
// pub mod server;

#[tokio::main]
async fn main() -> Result<(), Error> {
    let config = Configuration::new();

    let filter = EnvFilter::from_default_env();

    let loki_url = std::env::var("LOKI_URL")?;

    let (loki_tracing_layer, loki_tracing_task) = tracing_loki::builder()
        .label("host", "set-up-rust")?
        .build_url(Url::parse(&loki_url).unwrap())?;

    let subscriber = tracing_subscriber::fmt()
        .with_env_filter(filter)
        .json()
        .compact()
        .finish()
        .with(loki_tracing_layer);

    tracing::subscriber::set_global_default(subscriber).expect("Setting global default failed");

    let (event_emitter, rx) = EventEmitter::new();

    let room_service = Arc::new(RoomService::new(Mutex::new(rx)));
    let room_service_clone = room_service.clone();

    let client_service = Arc::new(ClientService::new());

    let server = Server::new(
        config.server.host,
        config.server.port.parse().unwrap(),
        config.is_production,
        event_emitter,
        room_service,
        client_service,
    );

    tokio::spawn(loki_tracing_task);

    tokio::spawn(async move {
        tracing::info!("Spawning Listening for events...");
        room_service_clone.listen_for_events().await;
    });

    server.run().await;

    Ok(())
}
