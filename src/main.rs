use std::sync::Arc;

use crate::config::Configuration;
use infra::{
    ba::{init_db_pool, AnalyticsObserver, BAService},
    error::Error,
};
use sentry::ClientOptions;
use sentry_tracing::EventFilter;
use server::Server;
use tracing_subscriber::{prelude::*, EnvFilter};

pub mod client;
pub mod config;
pub mod context;
pub mod game;
pub mod infra;
pub mod message;
pub mod room;
pub mod server;

#[tokio::main]
async fn main() -> Result<(), Error> {
    let config = Configuration::new();

    let _guard = sentry::init(ClientOptions {
        traces_sample_rate: 0.1,
        release: sentry::release_name!(),
        ..Default::default()
    });

    let filter = EnvFilter::from_default_env();
    let sentry_layer = sentry_tracing::layer().event_filter(|md| match md.level() {
        &tracing::Level::ERROR => EventFilter::Event,
        _ => EventFilter::Ignore,
    });

    let subscriber = tracing_subscriber::fmt()
        .with_env_filter(filter)
        .pretty()
        .json()
        .with_ansi(true)
        .with_thread_ids(true)
        .with_target(true)
        .compact()
        .finish()
        .with(sentry_layer);

    tracing::subscriber::set_global_default(subscriber).expect("Setting global default failed");

    let db_pool = init_db_pool(&config.server.db_url).await?;
    let analytics_observer: Arc<dyn AnalyticsObserver> = Arc::new(BAService::new(db_pool));

    let server = Server::new(
        config.server.host,
        config.server.port.parse().unwrap(),
        config.is_production,
        analytics_observer.clone(),
    );

    server.run().await;

    Ok(())
}
