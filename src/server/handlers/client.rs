use std::{convert::Infallible, path::Path, sync::Arc};

use axum::{
    headers::Origin,
    http::{Request, Response, StatusCode},
    Extension, TypedHeader,
};
use axum_extra::extract::{
    cookie::{Cookie, SameSite},
    CookieJar,
};
use hyper::{header::SET_COOKIE, http::HeaderValue, Body, Client, Uri};
use tokio::fs::read;
use uuid::Uuid;

use crate::server::server::AppState;

const ASSETS_DIR: &str = "dist";

#[axum::debug_handler]
pub async fn auth(
    jar: CookieJar,
    Extension(app_state): Extension<Arc<AppState>>,
    TypedHeader(origin): TypedHeader<Origin>,
) -> Result<Response<Body>, StatusCode> {
    let mut response = Response::new(Body::from("OK"));
    if jar.get("client_id").is_none() {
        let new_id = Uuid::new_v4().to_string();
        let mut cookie = Cookie::new("client_id", new_id);
        cookie.http_only();
        cookie.set_secure(true);
        cookie.set_same_site(SameSite::None);
        cookie.set_path("/");

        let origin_str = origin.to_string();
        if app_state.allowed_origins.contains(&origin_str.to_string()) {
            cookie.set_domain(origin.hostname());
        }

        let cookie_str = cookie.to_string();
        response.headers_mut().insert(
            SET_COOKIE,
            HeaderValue::from_str(&cookie_str).expect("Invalid header value"),
        );

        return Ok(response);
    }

    Ok(response)
}

pub async fn handle_client_proxy(
    Extension(app_state): Extension<Arc<AppState>>,
    mut req: Request<Body>,
) -> Result<Response<Body>, Infallible> {
    if app_state.is_production {
        let mut filename = req.uri().path().trim_start_matches('/');
        if filename.is_empty() {
            filename = "index.html";
        }

        let path = Path::new(ASSETS_DIR).join(filename);
        let (buf, mime_type) = if path.exists() {
            let mime_type = mime_guess::from_path(&path).first_or_octet_stream();
            (read(&path).await.unwrap(), mime_type)
        } else {
            let mime_type = mime_guess::from_ext("html").first_or_octet_stream();
            (
                read(Path::new(ASSETS_DIR).join("index.html"))
                    .await
                    .unwrap(),
                mime_type,
            )
        };

        let resp = Response::builder()
            .header("Content-Type", mime_type.as_ref())
            .header("Content-Length", buf.len().to_string())
            .header("Cache-Control", "public, max-age=3600") // 1 hour caching
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
