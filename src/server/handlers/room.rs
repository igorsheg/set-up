use crate::{
    context::Context,
    infra::error::{AppError, Error},
};
use axum::{extract::Path, http::StatusCode, response::IntoResponse, Extension, Json};
use axum_extra::extract::CookieJar;
use std::sync::Arc;
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

#[axum::debug_handler]
pub async fn get_past_rooms(
    Extension(context): Extension<Arc<Context>>,
    jar: CookieJar,
) -> Result<Json<Vec<String>>, AppError> {
    let cookie = jar
        .get("client_id")
        .ok_or_else(|| Error::AxumError("No client_id cookie found".to_string()))?;
    let client_id = Uuid::parse_str(cookie.value()).unwrap_or_else(|_| Uuid::new_v4());

    let mut client_manager = context.client_manager().lock().await;
    let client = client_manager.find_client(client_id)?;

    let past_rooms = client.get_past_rooms();

    Ok(Json(past_rooms.clone()))
}
