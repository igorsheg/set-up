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
    PlayerJoinedRoom(u16, String),
    PlayerLeft(u16, String), // client_id, room_code
    GameStateUpdated(u16, String),
    RoomCreated(String),
    RoomCreationFailed(String),
    ClientRoomCodeSet(u16, String),    // client_id, room_code
    ClientDisconnected(u16),           // client_id
    GameOver(String),                  // room_code
    PlayerRequestedCards(u16, String), // client_id, room_code
    PlayerFoundSet(u16, String),       // client_id, room_code
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
    RemovePlayerFromRoom(u16, String), // client_id, room_code
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CommandResult {
    RoomCreated(String),
    PlayerJoined(u16),
    PlayerReJoined(u16),
    ClientSetup(String),
    BroadcastDone(String),
    ClientRoomCodeSet(u16, String), // client_id, room_code
    NotHandled,
    Error(String),
    PlayerMoveInvalid,
    PlayerMoveValid,
    CardsRequested,
    PlayerRemovedFromRoom(u16, String), // client_id, room_code
}

#[derive(Debug, Clone)]
pub enum AppEvent {
    CommandReceived(Command, Sender<CommandResult>),
    EventOccurred(Event),
}
