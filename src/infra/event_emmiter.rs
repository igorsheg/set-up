use std::sync::Arc;

use ahash::{HashMap, HashMapExt};
use async_trait::async_trait;
use tokio::sync::{
    broadcast::{self, Receiver, Sender},
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
    async fn topic_sender(&self, topic: Topic) -> Result<Sender<AppEvent>, Error> {
        {
            let read_lock = self.topics.lock().await;
            if let Some(sender) = read_lock.get(&topic.to_string()) {
                return Ok(sender.clone());
            }
        }

        let mut write_lock = self.topics.lock().await;

        if let Some(sender) = write_lock.get(&topic.to_string()) {
            return Ok(sender.clone());
        }

        let (sender, _) = broadcast::channel(CHANNEL_CAPACITY);

        write_lock.insert(topic.to_string(), sender.clone());

        Ok(sender)
    }

    pub async fn emit_event(&self, topic: Topic, event: Event) -> Result<(), Error> {
        self.emit(AppEvent::EventOccurred(event), topic).await
    }

    pub async fn emit_command(
        &self,
        topic: Topic,
        command: Command,
    ) -> Result<CommandResult, Error> {
        let (tx, mut rx) = mpsc::channel(1);
        self.emit(AppEvent::CommandReceived(command, tx), topic)
            .await?;

        match rx.recv().await {
            Some(result) if result != CommandResult::NotHandled => Ok(result),
            Some(_) => Err(Error::EventEmitError(
                "Unexpected command result".to_string(),
            )),
            None => Err(Error::EventEmitError(
                "No service handled the command".to_string(),
            )),
        }
    }

    async fn emit(&self, app_event: AppEvent, topic: Topic) -> Result<(), Error> {
        let tx = self.topic_sender(topic.clone()).await?;
        tx.send(app_event).map_err(|_| {
            Error::EventEmitError(format!("Failed to send event to topic: {}", topic))
        })?;
        Ok(())
    }

    pub async fn subscribe(&self, topic: Topic) -> Result<broadcast::Receiver<AppEvent>, Error> {
        let tx = self.topic_sender(topic).await?;
        Ok(tx.subscribe())
    }

    pub async fn register_listener<S: EventListener + Sync + Send + 'static>(
        &self,
        service: S,
        topic: Topic,
    ) -> Result<(), Error> {
        let _ = self.topic_sender(topic.clone()).await?;

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

        Ok(())
    }
}

#[async_trait]
pub trait EventListener {
    async fn get_event_receiver(&self) -> Result<broadcast::Receiver<AppEvent>, Error>;

    async fn listen_for_events(&self) -> Result<(), Error> {
        let mut receiver = self.get_event_receiver().await?;
        while let Ok(event) = receiver.recv().await {
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
        Ok(())
    }
}

#[async_trait]
pub trait EventEmitterTrait {
    async fn emit_event(&self, topic: Topic, event: Event) -> Result<(), Error>;
    async fn emit_command(&self, topic: Topic, command: Command) -> Result<CommandResult, Error>;
    async fn subscribe(&self, topic: Topic) -> Result<Receiver<AppEvent>, Error>;
    async fn register_listener<S: EventListener + Sync + Send + 'static>(
        &self,
        service: S,
        topic: Topic,
    ) -> Result<(), Error>;
}
