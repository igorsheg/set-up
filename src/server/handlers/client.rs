use std::{convert::Infallible, path::Path, sync::Arc};

use axum::{
    http::{Request, Response, StatusCode},
    Extension,
};
use axum_extra::extract::{cookie::Cookie, CookieJar};
use hyper::{Body, Client, Uri};
use tokio::fs::read;
use uuid::Uuid;

use crate::server::server::AppState;

const ASSETS_DIR: &str = "dist";

pub async fn auth(jar: CookieJar) -> Result<(CookieJar, String), StatusCode> {
    let mut new_jar = jar.clone();
    if new_jar.get("client_id").is_none() {
        let new_id = Uuid::new_v4().to_string();
        let mut cookie = Cookie::new("client_id", new_id);
        cookie.set_path("/");
        new_jar = new_jar.add(cookie);
    }

    Ok((new_jar, "Please connect to the WebSocket at /ws".into()))
}

pub async fn handle_client_proxy(
    Extension(app_state): Extension<Arc<AppState>>,
    mut req: Request<Body>,
) -> Result<Response<Body>, Infallible> {
    if app_state.is_production {
        let mut filename = req.uri().path().trim_start_matches('/');
        if filename.is_empty() || filename == "/" {
            filename = "index.html";
        }

        let path = Path::new(ASSETS_DIR).join(filename);
        let buf = if path.exists() {
            read(&path).await.unwrap()
        } else {
            read(Path::new(ASSETS_DIR).join("index.html"))
                .await
                .unwrap()
        };

        let mime_type = mime_guess::from_path(&path).first_or_octet_stream();
        let resp = Response::builder()
            .header("Content-Type", mime_type.as_ref())
            .header("Content-Length", buf.len().to_string())
            .body(Body::from(buf))
            .unwrap();

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
