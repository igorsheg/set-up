use axum::{http::Method, response::IntoResponse, routing::get, Extension, Json};
use rand::{distributions::Alphanumeric, Rng};
use serde_json::json;
use std::{net::SocketAddr, sync::Arc};
use tokio::sync::Mutex;
use tower_http::cors::{Any, CorsLayer};

use crate::{
    application::services::game::GameSessionService,
    domain::game::{Hand, Stock},
    presentation::http::websocket,
};

pub struct Services {
    pub game_session: Arc<Mutex<GameSessionService>>,
}

pub struct Server {
    host: String,
    port: u16,
    services: Services,
}

impl Server {
    pub fn new(host: String, port: u16, services: Services) -> Self {
        Self {
            host,
            port,
            services,
        }
    }

    pub async fn run(&self) {
        let addr: SocketAddr = format!("{}:{}", self.host, self.port)
            .parse()
            .expect("Unable to parse address");

        let cors = CorsLayer::new()
            .allow_methods(vec![
                Method::GET,
                Method::POST,
                Method::PATCH,
                Method::PUT,
                Method::OPTIONS,
            ])
            .allow_origin(Any)
            .allow_headers(vec![
                axum::http::header::CONTENT_TYPE,
                axum::http::header::CACHE_CONTROL,
                axum::http::header::AUTHORIZATION,
            ]);

        let app = axum::Router::new()
            .route("/start-match", get(start_match))
            .route("/game/:code/ws", get(websocket::controller::handler))
            .layer(Extension(self.services.game_session.clone()))
            .layer(cors);

        debug!("listening on {}", &addr);

        axum::Server::bind(&addr)
            .serve(app.into_make_service())
            .await
            .unwrap();
    }
}

async fn start_match(
    Extension(state): Extension<Arc<Mutex<GameSessionService>>>,
) -> impl IntoResponse {
    let code: String = rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(6)
        .map(char::from)
        .collect();

    let stock = Stock::from_seed(0);
    let (_stock, hand) = Hand::from_stock(&stock);
    let _ = state.lock().await.create_session(hand, code.clone()); // Lock the GameSessionService

    // Create a new game session with the code (logic here)

    (axum::http::StatusCode::OK, Json(code))
}
