use std::{net::SocketAddr, sync::Arc};

use axum::{
    http::{header, HeaderValue},
    middleware::map_response,
    response::{IntoResponse, Response},
    routing::get,
    Extension,
};

use crate::{
    context::Context,
    server::handlers::{
        asset,
        client::auth,
        room::{check_game_exists, get_past_rooms, new_room_handler},
        websocket::ws_handler,
    },
};

pub struct Server {
    host: String,
    port: u16,
    is_production: bool,
}

pub struct AppState {
    pub is_production: bool,
}

impl AppState {
    pub fn new(is_production: bool) -> Self {
        Self { is_production }
    }
}

impl Server {
    pub fn new(host: String, port: u16, is_production: bool) -> Self {
        Self {
            host,
            port,
            is_production,
        }
    }

    pub async fn run(&self) {
        let addr: SocketAddr = format!("{}:{}", self.host, self.port)
            .parse()
            .expect("Unable to parse address");

        let context = Arc::new(Context::new()); // Modify this line
        let app_state = Arc::new(AppState::new(self.is_production));

        let api_routes = axum::Router::new()
            .route("/health", get(health_check))
            .route("/new", get(new_room_handler))
            .route("/games", get(get_past_rooms))
            .route("/game/:room_code", get(check_game_exists))
            .route("/auth", get(auth))
            .route("/ws", get(ws_handler));

        let app = axum::Router::new()
            .nest("/api", api_routes)
            .fallback(asset::handler)
            .layer(Extension(app_state))
            .layer(Extension(context))
            .layer(map_response(|mut resp: Response| async {
                resp.headers_mut().insert(
                    header::SERVER,
                    HeaderValue::from_static(concat!("set-up", env!("CARGO_PKG_VERSION"))),
                );
                resp
            }));

        tracing::debug!("Listening on {}", &addr);

        axum::Server::bind(&addr)
            .serve(app.into_make_service())
            .await
            .unwrap();
    }
}

async fn health_check() -> impl IntoResponse {
    axum::http::StatusCode::OK
}
