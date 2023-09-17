use crate::config::Configuration;
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
async fn main() -> std::io::Result<()> {
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
        .with_ansi(true)
        .with_thread_ids(true)
        .with_target(true)
        .compact()
        .finish()
        .with(sentry_layer);

    tracing::subscriber::set_global_default(subscriber).expect("Setting global default failed");

    let server = Server::new(
        config.server.host,
        config.server.port.parse().unwrap(),
        config.is_production,
    );

    server.run().await;

    Ok(())
}
