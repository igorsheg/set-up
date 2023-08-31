use std::sync::Arc;

use crate::{
    client::Client,
    context::Context,
    infra::error::Error,
    message::{MessageType, WsMessage},
};
use axum::{
    extract::{
        ws::{Message, WebSocket},
        WebSocketUpgrade,
    },
    response::IntoResponse,
    Extension,
};
use axum_extra::extract::CookieJar;
use futures::{sink::SinkExt, stream::StreamExt};
use tokio::sync::mpsc;
use uuid::Uuid;

#[axum::debug_handler]
pub async fn ws_handler(
    ws: WebSocketUpgrade,
    Extension(context): Extension<Arc<Context>>,
    jar: CookieJar,
) -> impl IntoResponse {
    log::debug!("ws_handler");

    let cookie = jar.get("client_id");
    let client_id = Uuid::parse_str(cookie.unwrap().value()).unwrap_or_else(|_| Uuid::new_v4());
    log::debug!("Client ID -------------> {:?}", client_id);

    ws.on_upgrade(move |socket| async move {
        if let Err(err) = handle_connection(socket, context, client_id).await {
            log::error!("An error occurred in the websocket handler: {}", err);
        }
    })
}

pub async fn handle_connection(
    ws: WebSocket,
    context: Arc<Context>,
    client_id: Uuid,
) -> Result<(), Error> {
    let (tx, rx) = mpsc::channel(32);

    {
        let mut client_manager = context.client_manager().lock().await;
        if client_manager.find_client(client_id).is_ok() {
            client_manager.remove_client(client_id);
        }
        client_manager.add_client(client_id, Client::new(tx.clone(), client_id));
    }

    let (mut ws_tx, ws_rx) = ws.split();
    let context_clone = context.clone();

    let reader_task = tokio::spawn(async move {
        let mut ws_rx = ws_rx;
        while let Some(Ok(msg)) = ws_rx.next().await {
            if let Ok(text) = msg.to_text() {
                let message: Result<WsMessage, _> = serde_json::from_str(text);
                match message {
                    Ok(message) => match MessageType::from_ws_message(message.clone()) {
                        Ok(message_type) => {
                            if let Err(err) = context.handle_message(message_type, client_id).await
                            {
                                log::error!(
                                    "Error handling message: {}. Original message: {:?}",
                                    err,
                                    message
                                );
                            }
                        }
                        Err(e) => {
                            log::error!(
                                "Failed to convert to MessageType: {}. Original message: {:?}",
                                e,
                                message
                            );
                        }
                    },
                    Err(e) => {
                        log::error!(
                            "Failed to parse WebSocket message: {}. Original text: {}",
                            e,
                            text
                        );
                    }
                }
            }
        }

        let mut room_manager = context.room_manager().lock().await;
        let mut client_manager = context.client_manager().lock().await;
        room_manager
            .handle_leave(client_id, &mut client_manager)
            .await
            .expect("Failed to handle client leave");
    });

    let writer_task = tokio::spawn(async move {
        let mut rx = rx;
        while let Some(message) = rx.recv().await {
            log::debug!("Preparing to send game message to WebSocket...");
            let json_message = serde_json::to_string(&message).unwrap();
            if let Err(err) = ws_tx.send(Message::Text(json_message)).await {
                log::error!("Failed to send game message to WebSocket. Error: {:?}", err);
            }
        }
    });

    let join_result = tokio::try_join!(reader_task, writer_task);
    if let Err(err) = join_result {
        log::error!(
            "An error occurred while processing the WebSocket tasks: {:?}",
            err
        );
        return Err(Error::WebsocketError(
            "An error occurred while processing the WebSocket tasks".to_string(),
        ));
    }

    {
        let mut client_manager = context_clone.client_manager().lock().await;
        client_manager.remove_client(client_id)
    }

    Ok(())
}

