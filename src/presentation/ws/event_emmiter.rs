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

#[derive(Clone)]
pub struct EventEmitter {
    topics: Arc<Mutex<HashMap<String, Sender<AppEvent>>>>,
}

impl EventEmitter {
    pub fn new(capacity: usize) -> Self {
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
        let tx = self.topic_sender(topic, 32).await;
        tx.send(AppEvent::EventOccurred(event))
            .map_err(Error::from)?;
        Ok(())
    }

    pub async fn emit_app_event(&self, topic: Topic, app_event: AppEvent) -> Result<(), Error> {
        let tx = self.topic_sender(topic, 32).await;
        tx.send(app_event).map_err(Error::from)?;
        Ok(())
    }

    pub async fn emit_command(
        &self,
        topic: Topic,
        command: Command,
    ) -> Result<CommandResult, Error> {
        // We'll use a one-shot channel to get the result back after processing
        let (tx, mut rx) = mpsc::channel(2);

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
        let tx = self.topic_sender(topic, 32).await;
        tx.subscribe()
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
}
