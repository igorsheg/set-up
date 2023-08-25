use axum::{
    http::Method,
    http::{uri::Uri, Request, Response},
    routing::get,
    Extension,
};
use hyper::{http::HeaderValue, Body, Client};
use std::{convert::Infallible, net::SocketAddr, sync::Arc};
use tokio::sync::Mutex;
use tower_http::cors::CorsLayer;

pub struct Server {
    host: String,
    port: u16,
    is_production: bool,
}

pub struct AppState {
    is_production: bool,
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

        let context = Arc::new(Mutex::new(Context::new()));
        let app_state = Arc::new(AppState::new(self.is_production));

        let api_routes = axum::Router::new()
            .route("/new", get(new_room_handler))
            .route("/games", get(get_past_rooms))
            .route("/game/:room_code", get(check_game_exists))
            .route("/auth", get(init_client))
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

pub async fn handle_client_proxy(
    Extension(app_state): Extension<Arc<AppState>>,
    mut req: Request<Body>,
) -> Result<Response<Body>, Infallible> {
    if app_state.is_production {
        let path = req.uri().path();

        let file_path = if path == "/" {
            "build/index.html".to_string()
        } else {
            format!("path/to/react/build/dir{}", path)
        };

        let data = tokio::fs::read(file_path)
            .await
            .unwrap_or_else(|_| Vec::new());

        let resp = Response::builder().body(Body::from(data)).unwrap();

        Ok(resp)
    } else {
        let client_port = "5173".to_string();

        let path_query = req
            .uri()
            .path_and_query()
            .map(|v| v.as_str())
            .unwrap_or(req.uri().path());

        let uri = format!("http://{}:{}{}", "localhost", client_port, path_query);
        *req.uri_mut() = Uri::try_from(uri).unwrap();

        let client = Client::new();
        let resp = client.request(req).await.unwrap();

        Ok(resp)
    }
}
