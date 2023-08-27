use crate::context::Context;
use axum::{extract::Path, http::StatusCode, response::IntoResponse, Extension, Json};
use axum_extra::extract::CookieJar;
use std::{collections::HashSet, sync::Arc};
use uuid::Uuid;

pub async fn check_game_exists(
    Path(room_code): Path<String>,
    Extension(context): Extension<Arc<Context>>,
) -> impl IntoResponse {
    let mut room_manager = context.room_manager().lock().await;

    match room_manager.get_game_state(&room_code) {
        Ok(_) => StatusCode::OK,
        Err(_) => StatusCode::NOT_FOUND,
    }
}

#[axum::debug_handler]
pub async fn new_room_handler(Extension(context): Extension<Arc<Context>>) -> impl IntoResponse {
    if let Ok(room_code) = context.new_room().await {
        Json(room_code)
    } else {
        Json("Error creating room".to_string())
    }
}

pub async fn get_past_rooms(
    Extension(context): Extension<Arc<Context>>,
    jar: CookieJar,
) -> impl IntoResponse {
    let cookie = jar.get("client_id");
    let client_id = Uuid::parse_str(cookie.unwrap().value()).unwrap_or_else(|_| Uuid::new_v4());

    // let ctx = context.lock().await;
    // if let Some(client_data) = ctx.clients_data.get(&client_id) {
    //     log::debug!("Client: {:?}", client_data);
    //     return Json(client_data.rooms_joined.clone());
    // }
    Json(HashSet::<String>::new())
}
