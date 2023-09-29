use infra::error::Error;
use server::Server;
use tracing_loki::url::Url;
use tracing_subscriber::{prelude::*, EnvFilter};

use crate::config::Configuration;

pub mod client;
pub mod config;
pub mod context;
pub mod events;
pub mod game;
pub mod infra;
pub mod message;
pub mod room;
pub mod server;
pub mod test;

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

    let server = Server::new(
        config.server.host,
        config.server.port.parse().unwrap(),
        config.is_production,
    );

    tokio::spawn(loki_tracing_task);

    server.run().await;

    Ok(())
}
