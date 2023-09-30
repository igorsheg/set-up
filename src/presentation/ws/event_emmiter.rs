use async_trait::async_trait;
use tokio::sync::broadcast;

use crate::{domain::events::AppEvent, infra::error::Error};

#[derive(Clone)]
pub struct EventEmitter {
    tx: broadcast::Sender<AppEvent>,
}

impl EventEmitter {
    pub fn new(capacity: usize) -> Self {
        let (tx, _) = broadcast::channel(capacity);
        Self { tx }
    }

    pub async fn emit(&self, event: AppEvent) -> Result<(), Error> {
        self.tx.send(event).map_err(Error::from)?;
        Ok(())
    }

    pub fn subscribe(&self) -> broadcast::Receiver<AppEvent> {
        self.tx.subscribe()
    }

    pub fn get_sender(&self) -> &broadcast::Sender<AppEvent> {
        &self.tx
    }
}

#[async_trait]
pub trait EventListener {
    fn get_event_receiver(&self) -> broadcast::Receiver<AppEvent>;

    async fn listen_for_events(&self, event_emitter: EventEmitter) -> Result<(), Error> {
        let mut receiver = self.get_event_receiver();
        while let Ok(event) = receiver.recv().await {
            tracing::info!("Event received");
            self.handle_event(event, &event_emitter).await?;
        }
        Ok(())
    }

    async fn handle_event(
        &self,
        event: AppEvent,
        event_emitter: &EventEmitter,
    ) -> Result<(), Error>;
}
