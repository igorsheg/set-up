use std::str::FromStr;

use chrono::Utc;
use serde::Serialize;
use sqlx::{
    sqlite::{SqliteConnectOptions, SqliteJournalMode},
    SqlitePool,
};
use strum::{Display, EnumString};
use uuid::Uuid;

use super::error::Error;

#[derive(Debug, Clone, Serialize, EnumString, Display)]
pub enum EventType {
    // Room-related events
    RoomCreated,
    RoomDestroyed,
    RoomReset,

    // Player-related events
    PlayerJoined,
    PlayerLeft,
    PlayerRejoined,
    PlayerRequestedCards,

    // Game-related events
    GameStarted,
    GamePaused,
    GameResumed,
    GameOver,
    GameReset,

    // Move-related events
    PlayerMoved,
    PlayerMoveValid,
    PlayerMoveInvalid,

    // Score-related events
    PlayerScoreUpdated,

    // Error-related events
    ClientError,
    ServerError,

    UnknownEvent,
}

#[derive(Debug, Clone, Serialize)]
pub struct Event {
    event_type: EventType,
    client_id: Option<Uuid>,
    room_code: Option<String>,
    additional_data: Option<serde_json::Value>,
    timestamp: chrono::DateTime<Utc>,
}

impl Event {
    pub fn new(
        event_type: EventType,
        client_id: Option<Uuid>,
        room_code: Option<String>,
        additional_data: Option<serde_json::Value>,
    ) -> Self {
        Self {
            event_type,
            client_id,
            room_code,
            additional_data,
            timestamp: chrono::Utc::now(),
        }
    }
}

pub struct BAService {
    db_pool: SqlitePool, // Assume we have a database pool here
}

impl BAService {
    pub fn new(db_pool: SqlitePool) -> Self {
        Self { db_pool }
    }

    pub async fn log_event(db_pool: &SqlitePool, event: Event) -> Result<(), sqlx::Error> {
        let mut conn = db_pool.acquire().await?;
        let Event {
            event_type,
            client_id,
            room_code,
            additional_data,
            timestamp,
        } = event;

        let client_id_str = client_id.map(|id| id.to_string());
        let additional_data_str = additional_data.map(|d| d.to_string());
        let timestamp_str = timestamp.to_rfc3339();
        let event_type_str = event_type.to_string();

        sqlx::query(
            "INSERT INTO events (event_type, client_id, room_code, additional_data, timestamp) VALUES (?, ?, ?, ?, ?)",
        ).bind(event_type_str)
            .bind(client_id_str)
            .bind(room_code)
            .bind(additional_data_str)
            .bind(timestamp_str)
        .execute(&mut *conn)
        .await?;

        Ok(())
    }
}

pub trait AnalyticsObserver: Send + Sync {
    fn observe(&self, event: Event);
}

impl AnalyticsObserver for BAService {
    fn observe(&self, event: Event) {
        let db_pool = self.db_pool.clone();
        tokio::spawn(async move {
            if let Err(err) = BAService::log_event(&db_pool, event).await {
                eprintln!("Failed to log event: {:?}", err);
            }
        });
    }
}

pub async fn init_db_pool(db_url: &str) -> Result<SqlitePool, Error> {
    let connect_options = SqliteConnectOptions::from_str(db_url)
        .map_err(|e| {
            tracing::error!("Error parsing SQLite connection string: {}", e);
            Error::DatabaseError(e.to_string())
        })?
        .journal_mode(SqliteJournalMode::Wal)
        .create_if_missing(true);

    let pool = SqlitePool::connect_with(connect_options)
        .await
        .map_err(|e| {
            tracing::error!("Unable to connect to database. Error: {}", e);
            Error::DatabaseError(e.to_string())
        })?;

    sqlx::migrate!().run(&pool).await?;

    tracing::info!("Successfully connected to database.");
    Ok(pool)
}
