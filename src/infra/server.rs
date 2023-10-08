use std::{net::SocketAddr, sync::Arc};

use axum::{
    http::{header, HeaderValue},
    middleware::map_response,
    response::{IntoResponse, Response},
    routing::get,
    Extension,
};

use super::event_emmiter::EventEmitter;
use crate::{
    application::{
        client::service::ClientService, game::service::GameService, room::service::RoomService,
    },
    presentation::{
        http::{asset, client::auth, room::new_room_handler},
        ws::handler::ws_handler,
    },
};

pub struct Server {
    host: String,
    port: u16,
    is_production: bool,
    game_controller: GameService<ClientService, RoomService, EventEmitter>,
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
    pub fn new(
        host: String,
        port: u16,
        is_production: bool,
        game_controller: GameService<ClientService, RoomService, EventEmitter>,
    ) -> Self {
        Self {
            host,
            port,
            is_production,
            game_controller,
        }
    }

    pub async fn run(&self) {
        let addr: SocketAddr = format!("{}:{}", self.host, self.port)
            .parse()
            .expect("Unable to parse address");

        let api_routes = axum::Router::new()
            .route("/health", get(health_check))
            .route("/new", get(new_room_handler))
            .route("/auth", get(auth))
            .route("/ws", get(ws_handler));

        let app_state = Arc::new(AppState::new(self.is_production));

        let app = axum::Router::new()
            .nest("/api", api_routes)
            .fallback(asset::handler)
            .layer(Extension(app_state))
            .layer(Extension(self.game_controller.clone()))
            .layer(map_response(|mut resp: Response| async {
                resp.headers_mut().insert(
                    header::SERVER,
                    HeaderValue::from_static(concat!("set-up", env!("CARGO_PKG_VERSION"))),
                );
                resp
            }));

        tracing::info!("Listening on {}", &addr);

        axum::Server::bind(&addr)
            .serve(app.into_make_service())
            .await
            .unwrap();
    }
}

async fn health_check() -> impl IntoResponse {
    axum::http::StatusCode::OK
}
