use std::sync::Arc;

use tokio::sync::Mutex;

use crate::{
    client::ClientManager,
    events::{AppEvent, EventEmitter, EventListener},
    room::RoomManager,
    test::Testy,
};

pub struct Context {
    client_manager: Arc<ClientManager>,
    room_manager: Arc<RoomManager>,
    pub event_emitter: Arc<Mutex<EventEmitter>>,
}

impl Default for Context {
    fn default() -> Self {
        Self::new()
    }
}

impl Context {
    // pub fn new() -> Self {
    //     let event_emitter = Arc::new(Mutex::new(EventEmitter::new()));
    //     let event_emitter_clone = Arc::clone(&event_emitter);
    //     let room_manager = RoomManager::new();
    //     let client_manager = ClientManager::new();
    //
    //     // tokio::spawn(async move {
    //     //     let event_emitter_lock = event_emitter_clone.lock().await;
    //     //     event_emitter_lock
    //     //         .register_listener(Box::new(move |event| {
    //     //             tokio::spawn(async move {
    //     //                 room_manager.handle_event(event.clone()).await;
    //     //             });
    //     //         }))
    //     //         .await;
    //     // });
    //
    //     tokio::spawn(async move {
    //         let event_emitter_lock = event_emitter_clone.lock().await;
    //         event_emitter_lock
    //             .register_listener(Box::new(|event| {
    //                 match event {
    //                     AppEvent::ClientConnected(client_id) => {
    //                         println!("Client Connected: {}", client_id);
    //                         // Handle the ClientConnected event
    //                     }
    //                     AppEvent::ClientDisconnected(client_id) => {
    //                         println!("Client Disconnected: {}", client_id);
    //                         // Handle the ClientDisconnected event
    //                     }
    //                     AppEvent::MessageReceived(id, message) => {
    //                         println!("Message Received from {}: {}", id, message);
    //                         // Handle the MessageReceived event
    //                     }
    //                     AppEvent::NewRoomCreated(room_code) => {
    //                         println!("Created new room {}", room_code);
    //                         // Handle the MessageReceived event
    //                     }
    //                     AppEvent::PlayerJoined(client_id, message) => {
    //                         room_manager
    //                             .handle_join(message, client_id, &client_manager)
    //                             .await
    //                     }
    //                 };
    //             }))
    //             .await;
    //     });
    //
    //     Self {
    //         client_manager,
    //         room_manager,
    //         event_emitter,
    //     }
    // }
    //

    pub fn new() -> Self {
        let event_emitter = Arc::new(Mutex::new(EventEmitter::new()));
        let room_manager = Arc::new(RoomManager::new());
        let client_manager = Arc::new(ClientManager::new());

        Self {
            client_manager,
            room_manager,
            event_emitter,
        }
    }

    pub fn start(&self) {
        let event_emitter_clone = Arc::clone(&self.event_emitter);
        let room_manager = Arc::clone(&self.room_manager);
        let client_manager = Arc::clone(&self.client_manager);

        tokio::spawn(async move {
            let event_emitter_lock = event_emitter_clone.lock().await;
            event_emitter_lock
                .register_listener(Box::new(move |event| {
                    match event {
                        AppEvent::PlayerJoined(client_id, message) => {
                            let room_manager = Arc::clone(&room_manager);
                            let client_manager = Arc::clone(&client_manager);
                            println!("Handling PlayerJoined: {}", client_id);
                            tokio::spawn(async move {
                                room_manager
                                    .handle_join(message, client_id, &*client_manager)
                                    .await;
                            });
                        } // handle other events...
                    }
                }))
                .await;
        });
    }

    pub fn client_manager(&self) -> &ClientManager {
        &self.client_manager
    }

    pub fn room_manager(&self) -> &RoomManager {
        &self.room_manager
    }

    // pub async fn new_room(&mut self, mode: GameMode) -> Result<String, Error> {
    //     self.room_manager.handle_new(mode).await
    // }
    //
    // pub async fn handle_message(
    //     &self,
    //     message_type: MessageType,
    //     client_id: u16,
    // ) -> Result<(), Error> {
    //     match message_type {
    //         MessageType::Join(message) => {
    //             self.room_manager
    //                 .handle_join(message, client_id, &self.client_manager)
    //                 .await
    //         }
    //         MessageType::Move(message) => {
    //             self.room_manager
    //                 .handle_move(message, client_id, &self.client_manager)
    //                 .await
    //         }
    //         MessageType::Request(message) => {
    //             self.room_manager
    //                 .handle_request(message, client_id, &self.client_manager)
    //                 .await
    //         }
    //         MessageType::Ping => Ok(()),
    //         MessageType::Leave => {
    //             self.room_manager
    //                 .handle_leave(client_id, &self.client_manager)
    //                 .await
    //         }
    //         MessageType::Reset(message) => {
    //             self.room_manager
    //                 .reset_game(message, &self.client_manager)
    //                 .await
    //         }
    //     }
    // }
}
