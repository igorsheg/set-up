use std::sync::Arc;

use ahash::{HashMap, HashMapExt};
use async_trait::async_trait;
use tokio::sync::{
    broadcast::{self, Sender},
    mpsc, Mutex,
};

use crate::{
    domain::events::{AppEvent, Command, CommandResult, Event, Topic},
    infra::error::Error,
};

const CHANNEL_CAPACITY: usize = 32;

#[derive(Clone)]
pub struct EventEmitter {
    topics: Arc<Mutex<HashMap<String, Sender<AppEvent>>>>,
}

impl Default for EventEmitter {
    fn default() -> Self {
        Self::new()
    }
}

impl EventEmitter {
    pub fn new() -> Self {
        let topics = HashMap::new();
        Self {
            topics: Arc::new(Mutex::new(topics)),
        }
    }
    pub async fn topic_sender(&self, topic: Topic, capacity: usize) -> broadcast::Sender<AppEvent> {
        let mut topics = self.topics.lock().await;
        topics
            .entry(topic.to_string())
            .or_insert_with(|| {
                let (tx, _) = broadcast::channel(capacity);
                tx
            })
            .clone()
    }

    pub async fn emit(&self, topic: Topic, event: Event) -> Result<(), Error> {
        let tx = self.topic_sender(topic, CHANNEL_CAPACITY).await;
        tx.send(AppEvent::EventOccurred(event))
            .map_err(Error::from)?;
        Ok(())
    }

    pub async fn emit_app_event(&self, topic: Topic, app_event: AppEvent) -> Result<(), Error> {
        let tx = self.topic_sender(topic, CHANNEL_CAPACITY).await;
        tx.send(app_event).map_err(Error::from)?;
        Ok(())
    }

    pub async fn emit_command(
        &self,
        topic: Topic,
        command: Command,
    ) -> Result<CommandResult, Error> {
        // We'll use a one-shot channel to get the result back after processing
        let (tx, mut rx) = mpsc::channel(1);

        // Emit the command as an AppEvent with a sender to get back results
        self.emit_app_event(topic, AppEvent::CommandReceived(command, tx))
            .await?;

        // Await for the result
        match rx.recv().await {
            Some(result) if result != CommandResult::NotHandled => {
                tracing::info!("Received command result: {:?}", result);
                Ok(result)
            }
            Some(_) => Err(Error::EventEmitError(
                "Unexpected error when waiting for command result".to_string(),
            )),
            None => Err(Error::EventEmitError(
                "No service handled the command".to_string(),
            )),
        }
    }

    pub async fn subscribe(&self, topic: Topic) -> broadcast::Receiver<AppEvent> {
        let tx = self.topic_sender(topic, CHANNEL_CAPACITY).await;
        tx.subscribe()
    }

    pub async fn register_listener<S: EventListener + Sync + Send + 'static>(
        &self,
        service: Arc<S>,
        topic: Topic,
    ) {
        // Set up the topic
        let _ = self.topic_sender(topic.clone(), CHANNEL_CAPACITY).await;

        tokio::spawn(async move {
            tracing::info!(
                "Spawning Listening for events for {} on topic {:?}",
                std::any::type_name::<S>(),
                topic
            );
            if let Err(e) = service.listen_for_events().await {
                tracing::error!(
                    "Error in listen_for_events for {}: {:?}",
                    std::any::type_name::<S>(),
                    e
                );
            }
        });
    }
}

#[async_trait]
pub trait EventListener {
    async fn get_event_receiver(&self) -> broadcast::Receiver<AppEvent>;

    async fn listen_for_events(&self) -> Result<(), Error> {
        let mut receiver = self.get_event_receiver().await;
        while let Ok(event) = receiver.recv().await {
            tracing::info!("Event received");
            self.handle_event(event).await?;
        }
        Ok(())
    }

    async fn handle_event(&self, event: AppEvent) -> Result<(), Error>;

    async fn handle_event_occurred(&self, _event: Event) -> Result<(), Error> {
        Ok(())
    }

    async fn handle_received_command(
        &self,
        _command: Command,
        _result_sender: tokio::sync::mpsc::Sender<CommandResult>,
    ) -> Result<(), Error> {
        Ok(()) // Default implementation does nothing
    }
}