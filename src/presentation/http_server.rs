use std::{net::SocketAddr, sync::Arc};

use axum::{
    http::Method,
    routing::{get, patch},
    Extension,
};
use tokio::sync::Mutex;
use tower_http::cors::{Any, CorsLayer};

use crate::{application::services::game::GameSessionService, presentation::websocket_server};

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

        // let service_routes = axum::Router::new()
        //     .route("/", get(list_services).patch(update_service))
        //     .route("/grid_order", patch(update_services_order))
        //     .layer(Extension(self.services.svc_service.clone()))
        //     .layer(Extension(self.services.uptime_service.clone()));
        //
        // let api_routes = axum::Router::new().nest("/services", service_routes);

        let app = axum::Router::new()
            .route("/ws", get(websocket_server::handler))
            .layer(Extension(self.services.game_session.clone()))
            .layer(cors);

        debug!("listening on {}", &addr);

        axum::Server::bind(&addr)
            .serve(app.into_make_service())
            .await
            .unwrap();

        println!("Server running on port {}", self.port);
    }
}
