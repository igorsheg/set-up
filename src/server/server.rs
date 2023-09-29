use std::{net::SocketAddr, sync::Arc};

use axum::{
    http::{header, HeaderValue},
    middleware::map_response,
    response::{IntoResponse, Response},
    routing::get,
    Extension,
};
use tokio::sync::Mutex;

use crate::{
    context::Context,
    events::{AppEvent, EventEmitter, EventListener},
    room::RoomManager,
    server::handlers::{
        asset,
        client::auth,
        room::{check_game_exists, get_past_rooms, new_room_handler},
        websocket::ws_handler,
    },
    test::Testy,
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

        // let event_emitter = Arc::new(Mutex::new(EventEmitter::new()));
        let context = Arc::new(Context::new()); // Modify this line
        context.start();
        let app_state = Arc::new(AppState::new(self.is_production));

        // let testy = Arc::new(Testy::new());

        // println!("Before registering RoomManager as listener");
        // event_emitter
        //     .lock()
        //     .await
        //     .register_listener(Box::new(move |event| {
        //         println!("RoomManager registered as listener");
        //         let testy = testy.clone();
        //         tokio::spawn(async move {
        //             testy.handle_event(event).await;
        //         });
        //     }))
        //     .await;
        // println!("After registering RoomManager as listener");

        // tokio::spawn(async move {
        //     loop {
        //         if let Some(event) = event_emitter.lock().await.poll_event().await {
        //             event_emitter.lock().await.emit(event).await;
        //         }
        //     }
        // });

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
