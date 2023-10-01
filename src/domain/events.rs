use async_trait::async_trait;
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
    PlayerJoined(u16, WsMessage),
    GameStateUpdated(u16, String),
    GameStateBroadcasted(WsMessage, Game),
    ClientRoomCodeSet(u16, String),
    RoomCreated(String),
    RoomCreationFailed(String),
}

#[derive(Debug, Clone)]
pub enum Command {
    CreateRoom(GameMode),
    RequestPlayerJoin(u16, WsMessage),
    SetupClient(u16, Sender<Game>),
    DisconnectClient(u16),
    BroadcastGameState(WsMessage, Game),
    SetClientRoomCode(u16, String),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CommandResult {
    RoomCreated(String),
    PlayerJoined(String),
    ClientSetup(String),
    BroadcastDone(String),
    NotHandled,
    Error(String),
}

#[derive(Debug, Clone)]
pub enum AppEvent {
    CommandReceived(Command, Sender<CommandResult>),
    EventOccurred(Event),
}

#[async_trait]
pub trait EventHandler {
    async fn handle_event(&self, event: AppEvent);
}
