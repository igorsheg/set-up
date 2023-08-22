use axum::{http::Method, routing::get, Extension};
use hyper::http::HeaderValue;
use std::{net::SocketAddr, sync::Arc};
use tokio::sync::Mutex;
use tower_http::cors::CorsLayer;

use crate::{
    client::{get_past_rooms, init_client, new_room_handler, ws_handler},
    context::Context,
};

pub struct Server {
    host: String,
    port: u16,
}

impl Server {
    pub fn new(host: String, port: u16) -> Self {
        Self { host, port }
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

        let context = Arc::new(Mutex::new(Context::new()));

        let app = axum::Router::new()
            .route("/new", get(new_room_handler))
            .route("/past_rooms", get(get_past_rooms))
            .route("/init", get(init_client))
            .route("/ws", get(ws_handler))
            .layer(cors)
            .layer(Extension(context));

        println!("Listening on {}", &addr);

        axum::Server::bind(&addr)
            .serve(app.into_make_service())
            .await
            .unwrap();
    }
}
