use strum::{Display, EnumString};
use tokio::sync::mpsc::Sender;

use super::{
    game::game::{Game, GameMode},
    message::WsMessage,
};

#[derive(Debug, Clone, PartialEq, Eq, Hash, EnumString, Display)]
pub enum Topic {
    RoomService,
    ClientService,
}

#[derive(Debug, Clone)]
pub enum Event {
    PlayerJoined(u16),
    GameStateUpdated(u16, String),
    // GameStateBroadcasted(WsMessage, Game),
    RoomCreated(String),
    RoomCreationFailed(String),
    ClientRoomCodeSet(u16, String), // client_id, room_code
}

#[derive(Debug, Clone)]
pub enum Command {
    CreateRoom(GameMode),
    RequestPlayerJoin(u16, WsMessage),
    SetupClient(u16, Sender<Game>),
    DisconnectClient(u16),
    BroadcastGameState(String, Game), // room_code, Game
    SetClientRoomCode(u16, String),
    PlayerMove(u16, WsMessage),
    RequestCards(u16, WsMessage),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CommandResult {
    RoomCreated(String),
    PlayerJoined(u16),
    ClientSetup(String),
    BroadcastDone(String),
    ClientRoomCodeSet(u16, String), // client_id, room_code
    NotHandled,
    Error(String),
    PlayerMoveInvalid,
    PlayerMoveValid,
    CardsRequested,
}

#[derive(Debug, Clone)]
pub enum AppEvent {
    CommandReceived(Command, Sender<CommandResult>),
    EventOccurred(Event),
}

// #[async_trait]
// pub trait EventHandler {
//     async fn handle_event(&self, event: AppEvent);
// }
