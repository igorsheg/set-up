use std::{collections::HashSet, sync::Arc};

use axum::{extract::Path, http::StatusCode, response::IntoResponse, Extension, Json};
use axum_extra::extract::CookieJar;
use tokio::sync::Mutex;
use uuid::Uuid;

use crate::{context::Context, game::game::Game};

pub async fn check_game_exists(
    Path(room_code): Path<String>,
    Extension(context): Extension<Arc<Mutex<Context>>>,
) -> impl IntoResponse {
    let ctx = context.lock().await;

    match ctx.rooms.get(&room_code) {
        Some(_) => StatusCode::OK,
        None => StatusCode::NOT_FOUND,
    }
}

pub async fn new_room_handler(
    Extension(context): Extension<Arc<Mutex<Context>>>,
) -> impl IntoResponse {
    let mut ctx = context.lock().await;
    let room_code = nanoid::nanoid!(6);
    let game = Game::new();
    ctx.rooms.insert(room_code.clone(), game);
    log::debug!("Created new game with room code {}", room_code);
    Json(room_code)
}

pub async fn get_past_rooms(
    Extension(context): Extension<Arc<Mutex<Context>>>,
    jar: CookieJar,
) -> impl IntoResponse {
    let cookie = jar.get("client_id");
    let client_id = Uuid::parse_str(cookie.unwrap().value()).unwrap_or_else(|_| Uuid::new_v4());

    log::debug!("Client ID: {:?}", client_id);

    let ctx = context.lock().await;
    if let Some(client_data) = ctx.clients_data.get(&client_id) {
        log::debug!("Client: {:?}", client_data);
        return Json(client_data.rooms_joined.clone());
    }
    Json(HashSet::new())
}
