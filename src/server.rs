use axum::{
    extract::Path,
    http::Method,
    http::{uri::Uri, Request, Response},
    routing::get,
    Extension,
};
use hyper::{http::HeaderValue, Body, Client};
use std::{convert::Infallible, net::SocketAddr, sync::Arc};
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

        let api_routes = axum::Router::new()
            .route("/new", get(new_room_handler))
            .route("/past_rooms", get(get_past_rooms))
            .route("/auth", get(init_client))
            .route("/ws", get(ws_handler));

        let app = axum::Router::new()
            .nest("/api", api_routes)
            .fallback(handle_client_proxy)
            .layer(cors)
            .layer(Extension(context));

        println!("Listening on {}", &addr);

        axum::Server::bind(&addr)
            .serve(app.into_make_service())
            .await
            .unwrap();
    }
}

pub async fn handle_client_proxy(mut req: Request<Body>) -> Result<Response<Body>, Infallible> {
    let client_port = "5173".to_string();

    let path = req.uri().path();
    let path_query = req
        .uri()
        .path_and_query()
        .map(|v| v.as_str())
        .unwrap_or(path);

    let uri = format!("http://{}:{}{}", "localhost", client_port, path_query);
    *req.uri_mut() = Uri::try_from(uri).unwrap();

    let client = Client::new();
    let resp = client.request(req).await.unwrap();

    Ok(resp)
}
