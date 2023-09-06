use axum::{http::Method, routing::get, Extension};
use hyper::http::HeaderValue;
use std::{net::SocketAddr, sync::Arc};
use tower_http::cors::CorsLayer;

use crate::{
    context::Context,
    server::handlers::{
        client::{auth, handle_client_proxy},
        room::{check_game_exists, get_past_rooms, new_room_handler},
        websocket::ws_handler,
    },
};

pub struct Server {
    host: String,
    port: u16,
    is_production: bool,
    allowed_origins: Vec<String>,
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
    pub fn new(host: String, port: u16, is_production: bool, allowed_origins: Vec<String>) -> Self {
        Self {
            host,
            port,
            is_production,
            allowed_origins,
        }
    }

    pub async fn run(&self) {
        let addr: SocketAddr = format!("{}:{}", self.host, self.port)
            .parse()
            .expect("Unable to parse address");

        let allowed_origins: Vec<HeaderValue> = self
            .allowed_origins
            .iter()
            .map(|origin| HeaderValue::from_str(origin).expect("Invalid header value"))
            .collect();

        let cors = CorsLayer::new()
            .allow_methods(vec![
                Method::GET,
                Method::POST,
                Method::PATCH,
                Method::PUT,
                Method::OPTIONS,
            ])
            .allow_origin(allowed_origins)
            .allow_credentials(true)
            .allow_headers(vec![
                axum::http::header::CONTENT_TYPE,
                axum::http::header::CACHE_CONTROL,
                axum::http::header::AUTHORIZATION,
            ]);

        let context = Arc::new(Context::new());
        let app_state = Arc::new(AppState::new(self.is_production));

        let api_routes = axum::Router::new()
            .route("/new", get(new_room_handler))
            .route("/games", get(get_past_rooms))
            .route("/game/:room_code", get(check_game_exists))
            .route("/auth", get(auth))
            .route("/ws", get(ws_handler));

        let app = axum::Router::new()
            .nest("/api", api_routes)
            .fallback(handle_client_proxy)
            .layer(Extension(app_state))
            .layer(Extension(context))
            .layer(cors);

        println!("Listening on {}", &addr);

        axum::Server::bind(&addr)
            .serve(app.into_make_service())
            .await
            .unwrap();
    }
}
