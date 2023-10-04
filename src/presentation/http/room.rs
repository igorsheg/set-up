use axum::{extract::Query, http::StatusCode, response::IntoResponse, Extension, Json};

use crate::{
    domain::{
        events::{Command, CommandResult, Topic},
        game::game::GameMode,
    },
    infra::event_emmiter::EventEmitter,
};

#[derive(serde::Deserialize, serde::Serialize, Debug, Clone)]
pub struct NewGameQuery {
    mode: Option<String>,
}

#[derive(serde::Serialize)]
struct RoomResponse {
    room_code: Option<String>,
    error: Option<String>,
}

#[axum::debug_handler]
pub async fn new_room_handler(
    Extension(event_emitter): Extension<EventEmitter>,
    Query(query): Query<NewGameQuery>,
) -> impl IntoResponse {
    let mode_str = query.mode.unwrap_or_else(|| "classic".to_string());

    match mode_str.parse::<GameMode>() {
        Ok(mode) => {
            let command = Command::CreateRoom(mode);
            match event_emitter
                .emit_command(Topic::RoomService, command)
                .await
            {
                Ok(CommandResult::RoomCreated(room_code)) => (
                    StatusCode::CREATED,
                    Json(RoomResponse {
                        room_code: Some(room_code),
                        error: None,
                    }),
                ),
                Ok(CommandResult::NotHandled) => (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(RoomResponse {
                        room_code: None,
                        error: Some("No service handled the command".to_string()),
                    }),
                ),
                Ok(CommandResult::Error(error_msg)) => (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(RoomResponse {
                        room_code: None,
                        error: Some(error_msg),
                    }),
                ),
                Err(e) => {
                    tracing::error!("Failed to emit command: {}", e);
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(RoomResponse {
                            room_code: None,
                            error: Some("Error creating room".to_string()),
                        }),
                    )
                }
                _ => (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(RoomResponse {
                        room_code: None,
                        error: Some("Unexpected command result".to_string()),
                    }),
                ),
            }
        }
        Err(_) => (
            StatusCode::BAD_REQUEST,
            Json(RoomResponse {
                room_code: None,
                error: Some("Invalid game mode".to_string()),
            }),
        ),
    }
}
