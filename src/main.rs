use std::sync::Arc;

use application::{client::service::ClientService, room::service::RoomService};
use domain::events::Topic;
use infra::{error::Error, event_emmiter::EventEmitter, server::Server};
use tracing_loki::url::Url;
use tracing_subscriber::{prelude::*, EnvFilter};

use crate::config::Configuration;

pub mod application;
pub mod config;
pub mod domain;
pub mod infra;
pub mod presentation;

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

    let event_emitter = EventEmitter::new();

    let room_service = Arc::new(RoomService::new(event_emitter.clone()));

    let client_service = Arc::new(ClientService::new(event_emitter.clone()));

    event_emitter
        .register_listener(room_service.clone(), Topic::RoomService)
        .await;
    event_emitter
        .register_listener(client_service.clone(), Topic::ClientService)
        .await;

    let server = Server::new(
        config.server.host,
        config.server.port.parse().unwrap(),
        config.is_production,
        event_emitter.clone(),
    );

    tokio::spawn(loki_tracing_task);

    server.run().await;

    Ok(())
}
