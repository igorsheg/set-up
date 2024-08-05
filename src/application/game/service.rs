use crate::infra::event_emmiter::EventEmitterError;
use axum::extract::ws::{Message, WebSocket};
use futures::SinkExt;
use futures::StreamExt;
use std::sync::Arc;
use tokio::sync::broadcast;
use tokio::sync::mpsc::{unbounded_channel, UnboundedSender};
use tokio_stream::wrappers::UnboundedReceiverStream;

use crate::{
    domain::{
        client::ClientServiceTrait,
        events::{AppEvent, Command, CommandResult, Event, Topic},
        game::game::Game,
        message::{MessageType, WsMessage},
        room::RoomServiceTrait,
    },
    infra::event_emmiter::{EventEmitter, EventEmitterTrait, EventListener},
};

#[derive(Clone)]
pub struct GameService<CS, RS>
where
    CS: ClientServiceTrait + Send + Sync + Clone + 'static,
    RS: RoomServiceTrait + Send + Sync + Clone + 'static,
{
    client_service: CS,
    room_service: RS,
    pub event_emitter: Arc<EventEmitter>,
}

impl<CS, RS> GameService<CS, RS>
where
    CS: ClientServiceTrait + Send + Sync + Clone + 'static + EventListener,
    RS: RoomServiceTrait + Send + Sync + Clone + 'static + EventListener,
{
    pub fn new(client_service: CS, room_service: RS, event_emitter: Arc<EventEmitter>) -> Self {
        Self {
            client_service,
            room_service,
            event_emitter,
        }
    }

    pub async fn start(&self, client_id: u16, ws: WebSocket) {
        let (ws_tx, ws_rx) = ws.split();
        let (tx, rx) = unbounded_channel::<Game>();
        let rx = UnboundedReceiverStream::new(rx);

        if let Err(e) = self.setup_client(client_id, tx).await {
            tracing::error!("Failed to setup client {}: {:?}", client_id, e);
            return;
        }

        let reader_task = self.read_from_ws(ws_rx, client_id);
        let writer_task = self.write_to_ws(rx, ws_tx);

        tokio::select! {
            result = reader_task => {
                if let Err(e) = result {
                    tracing::error!("Reader task failed: {:?}", e);
                }
            }
            result = writer_task => {
                if let Err(e) = result {
                    tracing::error!("Writer task failed: {:?}", e);
                }
            }
        }
    }

    async fn setup_client(
        &self,
        client_id: u16,
        tx: UnboundedSender<Game>,
    ) -> Result<(), EventEmitterError> {
        self.event_emitter.emit_event(
            Topic::ClientService,
            Event::ClientConnected(client_id, tx.clone()),
        )
    }

    async fn read_from_ws(
        &self,
        mut ws_rx: impl StreamExt<Item = Result<Message, axum::Error>> + Unpin,
        client_id: u16,
    ) -> Result<(), EventEmitterError> {
        while let Some(result) = ws_rx.next().await {
            match result {
                Ok(msg) => {
                    if let Err(e) = self.handle_incoming_message(msg, client_id).await {
                        tracing::error!(
                            "Error handling message from client {}: {:?}",
                            client_id,
                            e
                        );
                    }
                }
                Err(e) => {
                    tracing::error!("WebSocket error for client {}: {:?}", client_id, e);
                    break;
                }
            }
        }

        self.event_emitter
            .emit_event(Topic::ClientService, Event::ClientDisconnected(client_id))?;

        Ok(())
    }

    async fn handle_incoming_message(
        &self,
        msg: Message,
        client_id: u16,
    ) -> Result<(), EventEmitterError> {
        match msg {
            Message::Text(text) => {
                if text.trim().is_empty() {
                    return Ok(());
                }
                let message: WsMessage = serde_json::from_str(&text).map_err(|e| {
                    EventEmitterError::SendError(format!("Failed to parse message: {}", e))
                })?;
                let message_type = MessageType::from_ws_message(message.clone()).map_err(|e| {
                    EventEmitterError::SendError(format!("Invalid message type: {}", e))
                })?;

                match message_type {
                    MessageType::Join(message) => {
                        self.handle_join_message(client_id, message).await
                    }
                    MessageType::Move(message) => {
                        self.handle_move_message(client_id, message).await
                    }
                    MessageType::Request(message) => {
                        self.handle_request_message(client_id, message).await
                    }
                    _ => {
                        tracing::warn!("Unknown message type: {:?}", message_type);
                        Ok(())
                    }
                }
            }
            _ => Ok(()),
        }
    }

    async fn handle_join_message(
        &self,
        client_id: u16,
        message: WsMessage,
    ) -> Result<(), EventEmitterError> {
        self.event_emitter
            .emit_command(
                Topic::RoomService,
                Command::RequestPlayerJoin(client_id, message),
            )
            .await
            .map(|_| ())
    }

    async fn handle_move_message(
        &self,
        client_id: u16,
        message: WsMessage,
    ) -> Result<(), EventEmitterError> {
        self.event_emitter
            .emit_command(Topic::RoomService, Command::PlayerMove(client_id, message))
            .await
            .map(|_| ())
    }

    async fn handle_request_message(
        &self,
        client_id: u16,
        message: WsMessage,
    ) -> Result<(), EventEmitterError> {
        self.event_emitter
            .emit_command(
                Topic::RoomService,
                Command::RequestCards(client_id, message),
            )
            .await
            .map(|_| ())
    }

    async fn write_to_ws(
        &self,
        mut rx: UnboundedReceiverStream<Game>,
        mut ws_tx: impl futures::Sink<Message, Error = axum::Error> + Unpin,
    ) -> Result<(), EventEmitterError> {
        while let Some(game) = rx.next().await {
            let msg = serde_json::to_string(&game)
                .map(Message::Text)
                .unwrap_or_else(|_| Message::Text("MESSAGE_SERIALIZATION_ERROR".to_string()));

            if let Err(e) = ws_tx.send(msg).await {
                return Err(EventEmitterError::SendError(format!(
                    "Failed to send message to client: {:?}",
                    e
                )));
            }
        }
        Ok(())
    }
}

#[async_trait::async_trait]
impl EventEmitterTrait for EventEmitter {
    fn emit_event(&self, topic: Topic, event: Event) -> Result<(), EventEmitterError> {
        self.emit_event(topic, event)
    }

    async fn emit_command(
        &self,
        topic: Topic,
        command: Command,
    ) -> Result<CommandResult, EventEmitterError> {
        self.emit_command(topic, command).await
    }

    fn subscribe(&self, topic: Topic) -> broadcast::Receiver<AppEvent> {
        self.subscribe(topic)
    }

    async fn register_listener<S: EventListener + Send + Sync + 'static>(
        &self,
        service: S,
        topic: Topic,
    ) {
        self.register_listener(service, topic).await
    }
}
