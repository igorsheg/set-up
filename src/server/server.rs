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

        let cors = CorsLayer::new()
            .allow_methods(vec![
                Method::GET,
                Method::POST,
                Method::PATCH,
                Method::PUT,
                Method::OPTIONS,
            ])
            .allow_origin("http://localhost:5173".parse::<HeaderValue>().unwrap())
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
            .layer(cors)
            .layer(Extension(app_state))
            .layer(Extension(context));

        println!("Listening on {}", &addr);

        axum::Server::bind(&addr)
            .serve(app.into_make_service())
            .await
            .unwrap();
    }
}
