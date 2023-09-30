use tokio::sync::mpsc;

use crate::domain::events::AppEvent;

// Define the event emitter
#[derive(Clone)]
pub struct EventEmitter {
    tx: mpsc::Sender<AppEvent>,
}

impl EventEmitter {
    pub fn new() -> (Self, mpsc::Receiver<AppEvent>) {
        let (tx, rx) = mpsc::channel(32);
        (Self { tx }, rx)
    }

    pub async fn emit(&self, event: AppEvent) -> Result<(), mpsc::error::SendError<AppEvent>> {
        self.tx.send(event).await
    }
}
