use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};

use thiserror::Error as ThisError;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Clone, Debug, ThisError)]
pub enum Error {
    #[error("Axum error. {0}")]
    AxumError(String),

    #[error("Websocket error. {0}")]
    WebsocketError(String),

    #[error("JSON serialization error. {0}")]
    JsonError(String),

    #[error("JSON serialization error. {0}")]
    ClientNotFound(String),

    #[error("JSON serialization error. {0}")]
    UnknownMove(String),

    #[error("JSON serialization error. {0}")]
    GameError(String),

    #[error("Game rules error. {0}")]
    GameRuleError(String),
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

// Implement `From<AstroError>` for `AppError` to enable easy conversion:
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
