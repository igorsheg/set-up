use async_trait::async_trait;
use tokio::sync::{
    mpsc::{self, UnboundedReceiver, UnboundedSender},
    Mutex,
};

use crate::message::WsMessage;

// Define the different types of events that can be emitted
#[derive(Debug, Clone)]
pub enum AppEvent {
    // ClientConnected(String),
    // ClientDisconnected(String),
    // MessageReceived(String, String), // (id, message)
    // NewRoomCreated(String),
    PlayerJoined(u16, WsMessage),
}

// Define the EventEmitter struct
pub struct EventEmitter {
    pub listeners: Mutex<Vec<Box<dyn Fn(AppEvent) + Send + Sync>>>, // List of listeners
    // event_queue: Mutex<VecDeque<AppEvent>>, // Queue of events to be processed
    sender: UnboundedSender<AppEvent>, // Sender to enqueue events
    receiver: Mutex<UnboundedReceiver<AppEvent>>, // Receiver to dequeue events
}

impl Default for EventEmitter {
    fn default() -> Self {
        Self::new()
    }
}

impl EventEmitter {
    // Constructor to create a new EventEmitter
    pub fn new() -> Self {
        let (sender, receiver) = mpsc::unbounded_channel();
        Self {
            listeners: Mutex::new(Vec::new()),
            // event_queue: Mutex::new(VecDeque::new()),
            sender,
            receiver: Mutex::new(receiver),
        }
    }

    // Method to register a new listener
    pub async fn register_listener(&self, listener: Box<dyn Fn(AppEvent) + Send + Sync>) {
        println!("Registering listener-------------> {:p}", listener.as_ref());
        let mut listeners = self.listeners.lock().await;
        listeners.push(listener);
    }

    // Method to emit an event to all registered listeners
    pub async fn emit(&self, event: AppEvent) {
        println!("Emitting event-------------> {:?}", event);
        let listeners = self.listeners.lock().await;
        for listener in &*listeners {
            listener(event.clone());
        }
    }

    // Method to enqueue an event to the event queue
    pub fn enqueue_event(&self, event: AppEvent) {
        println!("Enqueuing event-------------> {:?}", event);
        self.sender.send(event).expect("Failed to enqueue event");
    }

    // Method to poll an event from the event queue
    pub async fn poll_event(&self) -> Option<AppEvent> {
        let mut receiver = self.receiver.lock().await;
        receiver.recv().await
    }
}

#[async_trait]
pub trait EventListener {
    async fn handle_event(&self, event: AppEvent);
}
