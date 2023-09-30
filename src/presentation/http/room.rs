use std::sync::Arc;

use axum::{
    extract::{Path, Query},
    http::StatusCode,
    response::IntoResponse,
    Extension, Json,
};
use axum_extra::extract::CookieJar;

use crate::{application::room_service::RoomService, domain::game::game::GameMode, infra::ba};

pub async fn check_game_exists(
    Path(room_code): Path<String>,
    Extension(room_service): Extension<Arc<RoomService>>,
) -> impl IntoResponse {
    match room_service.get_game_state(&room_code).await {
        Ok(_) => StatusCode::OK,
        Err(_) => {
            tracing::error!(room_code = %room_code, "Game not found");
            StatusCode::NOT_FOUND
        }
    }
}

#[derive(serde::Deserialize, serde::Serialize, Debug, Clone)]
pub struct NewGameQuery {
    mode: Option<String>,
}

#[axum::debug_handler]
pub async fn new_room_handler(
    Extension(room_service): Extension<Arc<RoomService>>,
    Query(query): Query<NewGameQuery>,
) -> impl IntoResponse {
    let mode_str = query.mode.unwrap_or_else(|| "classic".to_string());

    match mode_str.parse::<GameMode>() {
        Ok(mode) => {
            if let Ok(room_code) = room_service.start_new_game(mode).await {
                tracing::info!(
                event_type = %ba::EventType::RoomCreated,
                room_code = %room_code,
                mode = %mode_str,
                );
                Json(room_code)
            } else {
                Json("Error creating room".to_string())
            }
        }
        Err(_) => Json("Invalid game mode".to_string()),
    }
}

// #[axum::debug_handler]
// pub async fn get_past_rooms(
//     Extension(context): Extension<Arc<Context>>,
//     jar: CookieJar,
// ) -> Result<Json<Vec<String>>, AppError> {
//     let cookie = jar
//         .get("client_id")
//         .ok_or_else(|| Error::AxumError("No client_id cookie found".to_string()))?;
//     let client_id = cookie
//         .value()
//         .parse::<u16>()
//         .unwrap_or_else(|_| rand::random());
//
//     let client_arc = context.client_manager().find_client(client_id).await?;
//
//     let client = client_arc.lock().await;
//
//     let past_rooms = client.get_past_rooms();
//
//     Ok(Json(past_rooms.clone()))
// }
