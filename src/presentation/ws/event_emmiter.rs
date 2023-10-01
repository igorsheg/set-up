use async_trait::async_trait;
use tokio::sync::{broadcast, mpsc};

use crate::{
    domain::events::{AppEvent, Command, CommandResult, Event},
    infra::error::Error,
};

#[derive(Clone)]
pub struct EventEmitter {
    tx: broadcast::Sender<AppEvent>,
}

impl EventEmitter {
    pub fn new(capacity: usize) -> Self {
        let (tx, _) = broadcast::channel(capacity);
        Self { tx }
    }

    pub async fn emit(&self, event: Event) -> Result<(), Error> {
        self.tx
            .send(AppEvent::EventOccurred(event))
            .map_err(Error::from)?;
        Ok(())
    }

    pub async fn emit_app_event(&self, app_event: AppEvent) -> Result<(), Error> {
        self.tx.send(app_event).map_err(Error::from)?;
        Ok(())
    }

    pub async fn emit_command(&self, command: Command) -> Result<CommandResult, Error> {
        // We'll use a one-shot channel to get the result back after processing
        let (tx, mut rx) = mpsc::channel(1);

        // Emit the command as an AppEvent with a sender to get back results
        self.emit_app_event(AppEvent::CommandReceived(command, tx))
            .await?;

        // Wait for the result
        match rx.recv().await {
            Some(result) => Ok(result),
            None => Err(Error::EventEmitError(
                "Failed to get a result for the command".to_string(),
            )),
        }
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

    async fn listen_for_events(&self) -> Result<(), Error> {
        let mut receiver = self.get_event_receiver();
        while let Ok(event) = receiver.recv().await {
            tracing::info!("Event received");
            self.handle_event(event).await?;
        }
        Ok(())
    }

    async fn handle_event(&self, event: AppEvent) -> Result<(), Error>;
}
