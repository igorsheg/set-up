use std::sync::Arc;

use application::{client_service::ClientService, room_service::RoomService};
use domain::events::Topic;
use infra::{error::Error, server::Server};
use presentation::ws::event_emmiter::EventEmitter;
use tracing_loki::url::Url;
use tracing_subscriber::{prelude::*, EnvFilter};

use crate::{config::Configuration, presentation::ws::event_emmiter::EventListener};

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

    let event_emitter = EventEmitter::new(32);

    let room_service = Arc::new(RoomService::new(event_emitter.clone()));

    let client_service = Arc::new(ClientService::new(event_emitter.clone()));

    register_listener(room_service.clone(), Topic::RoomService, &event_emitter).await;
    register_listener(client_service.clone(), Topic::ClientService, &event_emitter).await;

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

async fn register_listener<S: EventListener + Sync + Send + 'static>(
    service: Arc<S>,
    topic: Topic,
    event_emitter: &EventEmitter,
) {
    // Set up the topic
    let _ = event_emitter.topic_sender(topic.clone(), 32).await;

    tokio::spawn(async move {
        tracing::info!(
            "Spawning Listening for events for {} on topic {:?}",
            std::any::type_name::<S>(),
            topic
        );
        if let Err(e) = service.listen_for_events().await {
            tracing::error!(
                "Error in listen_for_events for {}: {:?}",
                std::any::type_name::<S>(),
                e
            );
        }
    });
}
