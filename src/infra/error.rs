use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};
use thiserror::Error as ThisError;
use tokio::sync::{broadcast, mpsc::error::SendError};

use crate::domain::events::{AppEvent, CommandResult};

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Clone, Debug, ThisError)]
pub enum Error {
    #[error("Axum error. {0}")]
    AxumError(String),

    #[error("Websocket error. {0}")]
    WebsocketError(String),

    #[error("JSON serialization error. {0}")]
    JsonError(String),

    #[error("Client error. {0}")]
    ClientNotFound(String),

    #[error("Game move error. {0}")]
    UnknownMove(String),

    #[error("GameError. {0}")]
    GameError(String),

    #[error("Game rules error. {0}")]
    GameRuleError(String),

    #[error("Database error: {0}")]
    DatabaseError(String),

    #[error("Environment error: {0}")]
    EnviormentError(String),

    #[error("Room service error: {0}")]
    RoomNotFound(String),

    #[error("Event emit error: {0}")]
    EventEmitError(String),
}

pub struct AppError(pub Error);

// Tell axum how to convert `AppError` into a response.
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Something went wrong: {}", self.0),
        )
            .into_response()
    }
}

impl From<Error> for AppError {
    fn from(err: Error) -> Self {
        Self(err)
    }
}

impl From<axum::Error> for Error {
    fn from(axum_error: axum::Error) -> Self {
        Error::AxumError(axum_error.to_string())
    }
}

impl From<serde_json::Error> for Error {
    fn from(err: serde_json::Error) -> Self {
        Error::JsonError(err.to_string())
    }
}

impl From<tracing_loki::Error> for Error {
    fn from(err: tracing_loki::Error) -> Self {
        Error::DatabaseError(err.to_string())
    }
}

impl From<std::env::VarError> for Error {
    fn from(err: std::env::VarError) -> Self {
        Error::DatabaseError(err.to_string())
    }
}

impl From<SendError<AppEvent>> for Error {
    fn from(err: SendError<AppEvent>) -> Self {
        Error::EventEmitError(format!("Failed to send event: {:?}", err))
    }
}

impl From<broadcast::error::SendError<AppEvent>> for Error {
    fn from(err: broadcast::error::SendError<AppEvent>) -> Self {
        Error::EventEmitError(format!("Failed to send event: {:?}", err))
    }
}

impl From<&str> for Error {
    fn from(err: &str) -> Self {
        Error::EventEmitError(err.to_string())
    }
}

impl From<SendError<CommandResult>> for Error {
    fn from(err: SendError<CommandResult>) -> Self {
        Error::EventEmitError(format!("Failed to send command result: {:?}", err))
    }
}
