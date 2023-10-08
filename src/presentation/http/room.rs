use axum::{extract::Query, http::StatusCode, response::IntoResponse, Extension, Json};

use crate::{
    application::{
        client::service::ClientService, game::service::GameService, room::service::RoomService,
    },
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
    Extension(game_service): Extension<GameService<ClientService, RoomService, EventEmitter>>,
    Query(query): Query<NewGameQuery>,
) -> impl IntoResponse {
    let mode_str = query.mode.unwrap_or_else(|| "classic".to_string());

    let mode = match mode_str.parse::<GameMode>() {
        Ok(mode) => mode,
        Err(_) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(RoomResponse::new(
                    None,
                    Some("Invalid game mode".to_string()),
                )),
            )
        }
    };

    let event_emitter = &game_service.event_emitter;

    let command_result = match event_emitter
        .emit_command(Topic::RoomService, Command::CreateRoom(mode))
        .await
    {
        Ok(result) => result,
        Err(e) => {
            tracing::error!("Failed to emit command: {}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(RoomResponse::new(
                    None,
                    Some("Error creating room".to_string()),
                )),
            );
        }
    };

    match command_result {
        CommandResult::RoomCreated(room_code) => (
            StatusCode::CREATED,
            Json(RoomResponse::new(Some(room_code), None)),
        ),
        CommandResult::NotHandled => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(RoomResponse::new(
                None,
                Some("No service handled the command".to_string()),
            )),
        ),
        CommandResult::Error(error_msg) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(RoomResponse::new(None, Some(error_msg))),
        ),
        _ => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(RoomResponse::new(
                None,
                Some("Unexpected command result".to_string()),
            )),
        ),
    }
}

impl RoomResponse {
    pub fn new(room_code: Option<String>, error: Option<String>) -> Self {
        Self { room_code, error }
    }
}
