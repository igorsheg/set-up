import { NotificationMessage } from "@store/gameManager";
import {
  AppThunk,
  RootState,
  addNotification,
  clearNotification,
  clearSelectedCards,
  setEventLog,
  setGameData,
} from "@store/index";
import { MessageType, ws } from "@store/websocket";
import { Card, Data, Event } from "@types";

function difference(arrayA: Event[], arrayB: Event[]): Event[] {
  const setB = new Set(
    arrayB.map((item) => JSON.stringify([item.event_type, item.timestamp])),
  );
  return arrayA.filter(
    (item) => !setB.has(JSON.stringify([item.event_type, item.timestamp])),
  );
}

export const setGameState =
  (newData: Data): AppThunk =>
  (dispatch, getState) => {
    const currentEventLog = getState().gameManager.eventLog;

    const newEvents = difference(newData.events, currentEventLog);

    newEvents.forEach((event) => {
      switch (event.event_type) {
        case "PlayerJoined":
          dispatch(
            displayNotificationWithTimer({
              timestamp: event.timestamp,
              content: `Player ${event.data} joined the game`,
              icon: "",
            }),
          );
          break;
        case "PlayerFoundSet":
          dispatch(
            displayNotificationWithTimer({
              timestamp: event.timestamp,
              content: `${event.data} found a set!`,
              icon: "",
            }),
          );
          break;
        case "PlayerRequestedCards":
          dispatch(
            displayNotificationWithTimer({
              timestamp: event.timestamp,
              content: `${event.data} requested cards`,
              icon: "",
            }),
          );
          break;
        default:
          break;
      }
    });

    dispatch(setGameData(newData));
    dispatch(setEventLog(newData.events || []));
  };

export const moveCards =
  (cards: Card[]): AppThunk =>
  (dispatch, getState) => {
    const {
      roomManager: { activeRoom },
    } = getState() as RootState;

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: MessageType.MOVE,
          payload: { room_code: activeRoom?.code, cards },
        }),
      );
      dispatch(clearSelectedCards());
    }
  };

export const requestCards = (): AppThunk => (dispatch) => {
  dispatch({
    type: MessageType.REQUEST,
  });
  dispatch(clearSelectedCards());
};

export const displayNotificationWithTimer =
  (message: NotificationMessage): AppThunk =>
  (dispatch) => {
    const notification = {
      ...message,
      id: Date.now(),
    };

    dispatch(addNotification(notification));

    setTimeout(() => {
      dispatch(clearNotification());
    }, 6000);
  };
