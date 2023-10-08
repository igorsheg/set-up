use async_trait::async_trait;
use axum::extract::ws::{Message, WebSocket};
use futures::{StreamExt, TryStreamExt};
use tokio::sync::{
    broadcast::Receiver,
    mpsc::{unbounded_channel, UnboundedSender},
};
use tokio_stream::wrappers::UnboundedReceiverStream;

use crate::{
    domain::{
        client::ClientServiceTrait,
        events::{AppEvent, Command, CommandResult, Event, Topic},
        game::game::Game,
        message::{MessageType, WsMessage},
        room::RoomServiceTrait,
    },
    infra::{
        error::Error,
        event_emmiter::{self, EventEmitter, EventEmitterTrait, EventListener},
    },
};

#[derive(Clone)]
pub struct GameService<CS, RS, EE>
where
    CS: ClientServiceTrait + Send + Sync + Clone + 'static,
    RS: RoomServiceTrait + Send + Sync + Clone + 'static,
    EE: EventEmitterTrait + Send + Sync + Clone + 'static,
{
    client_service: CS,
    room_service: RS,
    pub event_emitter: EE,
}

impl<CS, RS, EE> GameService<CS, RS, EE>
where
    CS: ClientServiceTrait + Send + Sync + Clone + 'static + event_emmiter::EventListener,
    RS: RoomServiceTrait + Send + Sync + Clone + 'static + event_emmiter::EventListener,
    EE: EventEmitterTrait + Send + Sync + Clone + 'static,
{
    pub fn new(client_service: CS, room_service: RS, event_emitter: EE) -> Self {
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

        let _ = self.setup_client(client_id, tx).await;

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

    pub async fn setup_client(
        &self,
        client_id: u16,
        tx: UnboundedSender<Game>,
    ) -> Result<(), Error> {
        self.event_emitter
            .emit_event(
                Topic::ClientService,
                Event::ClientConnected(client_id, tx.clone()),
            )
            .await?;

        Ok(())
    }

    pub async fn read_from_ws(
        &self,
        mut ws_rx: impl StreamExt<Item = Result<Message, axum::Error>> + Unpin,
        client_id: u16,
    ) -> Result<(), Error> {
        while let Ok(result) = ws_rx.try_next().await {
            match result {
                Some(msg) => match self.handle_incoming_message(msg, client_id).await {
                    Ok(_) => (),
                    Err(e) => {
                        tracing::error!(
                            "Error while handling message from client {}: {}",
                            client_id,
                            e
                        );
                        continue;
                    }
                },
                None => {
                    tracing::error!("Failed to receive message from client {}", client_id);
                    break;
                }
            }
        }

        self.event_emitter
            .emit_event(Topic::ClientService, Event::ClientDisconnected(client_id))
            .await?;
        Ok(())
    }

    pub async fn handle_incoming_message(&self, msg: Message, client_id: u16) -> Result<(), Error> {
        let text = msg.to_text()?;
        if text.trim().is_empty() {
            tracing::info!("Received empty message, skipping.");
            return Ok(());
        }

        let message: WsMessage = serde_json::from_str(text)?;
        let message_type = MessageType::from_ws_message(message.clone())?;

        match message_type {
            MessageType::Join(message) => self.handle_join_message(client_id, message).await,
            MessageType::Move(message) => self.handle_move_message(client_id, message).await,
            MessageType::Request(message) => self.handle_request_message(client_id, message).await,
            _ => self.handle_unknown_message_type(message_type),
        }
    }

    pub async fn handle_join_message(
        &self,
        client_id: u16,
        message: WsMessage,
    ) -> Result<(), Error> {
        self.event_emitter
            .emit_command(
                Topic::RoomService,
                Command::RequestPlayerJoin(client_id, message),
            )
            .await?;
        Ok(())
    }

    pub async fn handle_move_message(
        &self,
        client_id: u16,
        message: WsMessage,
    ) -> Result<(), Error> {
        self.event_emitter
            .emit_command(Topic::RoomService, Command::PlayerMove(client_id, message))
            .await?;
        Ok(())
    }

    pub async fn handle_request_message(
        &self,
        client_id: u16,
        message: WsMessage,
    ) -> Result<(), Error> {
        self.event_emitter
            .emit_command(
                Topic::RoomService,
                Command::RequestCards(client_id, message),
            )
            .await?;
        Ok(())
    }

    pub fn handle_unknown_message_type(&self, message_type: MessageType) -> Result<(), Error> {
        tracing::warn!("Message type not handled: {:?}", message_type);
        Err(Error::WebsocketError(
            "Message type not handled".to_string(),
        ))
    }

    pub async fn handle_incoming_error(
        &self,
        client_id: u16,
        err: axum::Error,
    ) -> Result<(), Error> {
        tracing::error!(error = %err, "Error receiving WebSocket message");
        self.event_emitter
            .emit_event(Topic::ClientService, Event::ClientDisconnected(client_id))
            .await?;
        Err(Error::WebsocketError(err.to_string()))
    }

    pub async fn write_to_ws(
        &self,
        rx: UnboundedReceiverStream<Game>,
        mut ws_tx: impl futures::Sink<Message, Error = axum::Error> + Unpin,
    ) -> Result<(), Error> {
        let send_to_client = rx
            .map(|msg| {
                let msg = serde_json::to_string(&msg);
                match msg {
                    Ok(msg) => Message::Text(msg),
                    Err(_) => Message::Text("MESSAGE_SERIALIZATION_ERROR".to_string()),
                }
            })
            .map(Ok)
            .forward(&mut ws_tx)
            .await;

        match send_to_client {
            Ok(_) => Ok(()),
            Err(_) => Err(Error::WebsocketError(
                "Failed to forward messages to client".to_string(),
            )),
        }
    }
}

#[async_trait]
impl EventEmitterTrait for EventEmitter {
    async fn emit_event(&self, topic: Topic, event: Event) -> Result<(), Error> {
        self.emit_event(topic, event).await
    }

    async fn emit_command(&self, topic: Topic, command: Command) -> Result<CommandResult, Error> {
        self.emit_command(topic, command).await
    }

    async fn subscribe(&self, topic: Topic) -> Result<Receiver<AppEvent>, Error> {
        self.subscribe(topic).await
    }

    async fn register_listener<S: EventListener + Sync + Send + 'static>(
        &self,
        service: S,
        topic: Topic,
    ) -> Result<(), Error> {
        self.register_listener(service, topic).await
    }
}
