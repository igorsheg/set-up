use axum::{extract::Query, response::IntoResponse, Extension, Json};

use crate::{
    domain::{
        events::{Command, CommandResult},
        game::game::GameMode,
    },
    infra::ba,
    presentation::ws::event_emmiter::EventEmitter,
};

#[derive(serde::Deserialize, serde::Serialize, Debug, Clone)]
pub struct NewGameQuery {
    mode: Option<String>,
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
            match event_emitter.emit_command(command).await {
                Ok(CommandResult::RoomCreated(room_code)) => {
                    tracing::info!(
                        event_type = %ba::EventType::RoomCreated,
                        room_code = %room_code,
                        mode = %mode_str,
                    );
                    Json(room_code)
                }
                Ok(CommandResult::RoomCreationFailed(error_msg)) => Json(error_msg),
                Err(e) => {
                    tracing::error!("Failed to emit command: {}", e);
                    Json("Error creating room".to_string())
                }
            }
        }
        Err(_) => Json("Invalid game mode".to_string()),
    }
}
