use axum::{routing::get, Extension};
use minicdn::release_include_mini_cdn;
use std::{
    net::SocketAddr,
    sync::{Arc, RwLock},
};

use crate::{
    context::Context,
    server::handlers::{
        client::auth,
        room::{check_game_exists, get_past_rooms, new_room_handler},
        static_files::StaticFilesHandler,
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

        let context = Arc::new(Context::new());
        let app_state = Arc::new(AppState::new(self.is_production));

        let client = Arc::new(RwLock::new(release_include_mini_cdn!("../../web/dist")));

        let api_routes = axum::Router::new()
            .route("/new", get(new_room_handler))
            .route("/games", get(get_past_rooms))
            .route("/game/:room_code", get(check_game_exists))
            .route("/auth", get(auth))
            .route("/ws", get(ws_handler));

        let app = axum::Router::new()
            .nest("/api", api_routes)
            .fallback(get(StaticFilesHandler {
                cdn: client,
                prefix: "",
                browser_router: true,
            }))
            .layer(Extension(app_state))
            .layer(Extension(context));

        tracing::info!("Listening on {}", &addr);

        axum::Server::bind(&addr)
            .serve(app.into_make_service())
            .await
            .unwrap();
    }
}
