use dashmap::DashMap;
use std::sync::Arc;
use thiserror::Error;
use tokio::sync::{broadcast, mpsc};
use tokio::time::{timeout, Duration};
use tracing::{error, info, warn};

use crate::domain::events::{AppEvent, Command, CommandResult, Event, Topic};

const CHANNEL_CAPACITY: usize = 64;
const COMMAND_TIMEOUT: Duration = Duration::from_secs(5);

#[derive(Error, Debug, Clone)]
pub enum EventEmitterError {
    #[error("Failed to send event to topic: {0}")]
    SendError(String),
    #[error("No service handled the command")]
    NoHandler,
    #[error("Command handling timed out")]
    Timeout,
    #[error("Unexpected command result")]
    UnexpectedResult,
}

pub struct EventEmitter {
    topics: Arc<DashMap<Topic, broadcast::Sender<AppEvent>>>,
}

impl Default for EventEmitter {
    fn default() -> Self {
        Self::new()
    }
}

impl EventEmitter {
    pub fn new() -> Self {
        Self {
            topics: Arc::new(DashMap::new()),
        }
    }

    fn get_or_create_sender(&self, topic: Topic) -> broadcast::Sender<AppEvent> {
        self.topics
            .entry(topic)
            .or_insert_with(|| broadcast::channel(CHANNEL_CAPACITY).0)
            .clone()
    }

    pub fn emit_event(&self, topic: Topic, event: Event) -> Result<(), EventEmitterError> {
        let sender = self.get_or_create_sender(topic.clone());
        sender
            .send(AppEvent::EventOccurred(event.clone()))
            .map_err(|e| {
                let error_msg = format!(
                    "Failed to emit event {:?} to topic {:?}: {}",
                    event, topic, e
                );
                error!("{}", error_msg);
                EventEmitterError::SendError(error_msg)
            })?;
        Ok(())
    }

    pub async fn emit_command(
        &self,
        topic: Topic,
        command: Command,
    ) -> Result<CommandResult, EventEmitterError> {
        let sender = self.get_or_create_sender(topic);
        let (tx, mut rx) = mpsc::channel(1);

        sender
            .send(AppEvent::CommandReceived(command, tx))
            .map_err(|e| EventEmitterError::SendError(e.to_string()))?;

        match timeout(COMMAND_TIMEOUT, rx.recv()).await {
            Ok(Some(result)) if result != CommandResult::NotHandled => Ok(result),
            Ok(Some(_)) => Err(EventEmitterError::UnexpectedResult),
            Ok(None) => Err(EventEmitterError::NoHandler),
            Err(_) => Err(EventEmitterError::Timeout),
        }
    }

    pub fn subscribe(&self, topic: Topic) -> broadcast::Receiver<AppEvent> {
        self.get_or_create_sender(topic).subscribe()
    }

    pub async fn register_listener<S: EventListener + Send + Sync + 'static>(
        &self,
        service: S,
        topic: Topic,
    ) {
        let receiver = self.subscribe(topic.clone());
        tokio::spawn(async move {
            info!("Started listening for events on topic {:?}", topic);
            if let Err(e) = service.listen_for_events(receiver).await {
                error!("Error in listen_for_events: {:?}", e);
            }
        });
    }
}

#[async_trait::async_trait]
pub trait EventEmitterTrait: Send + Sync {
    fn emit_event(&self, topic: Topic, event: Event) -> Result<(), EventEmitterError>;
    async fn emit_command(
        &self,
        topic: Topic,
        command: Command,
    ) -> Result<CommandResult, EventEmitterError>;
    fn subscribe(&self, topic: Topic) -> broadcast::Receiver<AppEvent>;
    async fn register_listener<S: EventListener + Send + Sync + 'static>(
        &self,
        service: S,
        topic: Topic,
    );
}

#[async_trait::async_trait]
pub trait EventListener: Send + Sync {
    async fn listen_for_events(
        &self,
        mut receiver: broadcast::Receiver<AppEvent>,
    ) -> Result<(), EventEmitterError> {
        while let Ok(event) = receiver.recv().await {
            if let Err(e) = self.handle_event(event).await {
                warn!("Error handling event: {:?}", e);
            }
        }
        Ok(())
    }

    async fn handle_event(&self, event: AppEvent) -> Result<(), EventEmitterError>;
}
