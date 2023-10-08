use axum::{extract::WebSocketUpgrade, response::IntoResponse, Extension};
use axum_extra::extract::CookieJar;

use crate::{
    application::{
        client::service::ClientService, game::service::GameService, room::service::RoomService,
    },
    infra::{
        error::{AppError, Error},
        event_emmiter::EventEmitter,
    },
};

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    jar: CookieJar,
    Extension(game_service): Extension<GameService<ClientService, RoomService, EventEmitter>>,
) -> Result<impl IntoResponse, AppError> {
    tracing::info!("Starting WebSocket connection");
    match get_client_id_from_cookies(&jar) {
        Ok(client_id) => Ok(ws.on_upgrade(move |socket| async move {
            game_service.start(client_id, socket).await;
        })),
        Err(err) => {
            tracing::error!("Failed to get client ID: {}", err);
            Err::<_, AppError>(err.into())
        }
    }
}

fn get_client_id_from_cookies(jar: &CookieJar) -> Result<u16, Error> {
    jar.get("client_id")
        .and_then(|cookie| cookie.value().parse::<u16>().ok())
        .ok_or(Error::ClientIdMissing)
}
