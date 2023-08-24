import {
  AppThunk,
  hideNotification,
  setGameData,
  setNotificationTimer,
  setSelectedCards,
  showNotification,
} from "@store/index";
import { MessageType, ws } from "@store/websocket";
import { Card, Data, Player } from "@types";

export const setGameState =
  (newData: Data): AppThunk =>
  (dispatch, getState) => {
    const currentState = getState().gameManager.gameData;
    console.log("Current State Players: ", currentState.players);
    console.log("New Data Players: ", newData.players);
    if (
      JSON.stringify(currentState.last_set) !== JSON.stringify(newData.last_set)
    ) {
      const lastPlayer = newData.last_player;

      dispatch(displayNotificationWithTimer(`${lastPlayer} found a set!  🎉`));
    }

    if (currentState.players && newData.players) {
      console.log("New player detected: ");
      const prevPlayerIds = new Set(
        currentState.players.map((p: Player) => p.client_id),
      );
      const newPlayer = newData.players.find(
        (player: Player) => !prevPlayerIds.has(player.client_id),
      );

      if (newPlayer) {
        dispatch(
          displayNotificationWithTimer(
            `Player ${newPlayer.name} joined the game! 🎉`,
          ),
        );
      }
    }

    dispatch(setGameData(newData));
  };

export const moveCards =
  (cards: Card[]): AppThunk =>
  (dispatch, getState) => {
    dispatch(setSelectedCards(cards));

    const {
      roomManager: { activeRoom },
    } = getState();

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: MessageType.MOVE,
          payload: { room_code: activeRoom, cards },
        }),
      );
    }
  };

export const requestCards = (): AppThunk => (dispatch) => {
  dispatch({
    type: MessageType.REQUEST,
  });
};

export const displayNotificationWithTimer =
  (message: React.ReactElement | string): AppThunk =>
  (dispatch, getState) => {
    dispatch(showNotification(message));
    const index = getState().gameManager.notifications.length - 1;
    const timeoutId = setTimeout(() => {
      dispatch(hideNotification(index));
    }, 6000);

    dispatch(setNotificationTimer({ index, timer: timeoutId }));
  };
