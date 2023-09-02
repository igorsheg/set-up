import { Action, ThunkDispatch } from "@reduxjs/toolkit";
import { NotificationMessage } from "@store/gameManager";
import {
  AppThunk,
  RootState,
  clearSelectedCards,
  hideNotification,
  setGameData,
  // setSelectedCards,
  showNotification,
} from "@store/index";
import { MessageType, ws } from "@store/websocket";
import { Card, Data, Player } from "@types";
import { Hand, Sparkles, User } from "lucide-react";
import { deepEqual } from "../util/deepEqual";

type Dispatch = ThunkDispatch<RootState, unknown, Action<string>>;

const checkAndDispatchPlayersRequested = (
  newData: Data,
  currentState: Data,
  dispatch: Dispatch,
) => {
  const playersRequestedCards = checkPayerRequested(newData, currentState);
  if (playersRequestedCards.length) {
    playersRequestedCards.forEach((p) => {
      dispatch(
        displayNotificationWithTimer({
          content: `${p.name} requested cards`,
          icon: Hand,
        }),
      );
    });
  }
};

const checkAndDispatchLastSet = (
  newData: Data,
  currentState: Data,
  dispatch: Dispatch,
) => {
  if ((currentState.last_set, newData.last_set)) {
    const lastPlayer = newData.last_player;
    dispatch(
      displayNotificationWithTimer({
        content: `${lastPlayer} found a set!`,
        icon: Sparkles,
      }),
    );
  }
};

const checkAndDispatchNewPlayer = (
  newData: Data,
  currentState: Data,
  dispatch: Dispatch,
) => {
  if (currentState.players && newData.players) {
    const prevPlayerIds = new Set(
      currentState.players.map((p: Player) => p.client_id),
    );
    const newPlayer = newData.players.find(
      (player: Player) => !prevPlayerIds.has(player.client_id),
    );
    if (newPlayer) {
      dispatch(
        displayNotificationWithTimer({
          content: `Player ${newPlayer.name} joined the game`,
          icon: User,
        }),
      );
    }
  }
};

const checkPayerRequested = (newData: Data, currentState: Data): Player[] => {
  const getPlayersRequesting = (data: Data) =>
    data.players
      .filter((p) => p.request)
      .map((p) => ({ client_id: p.client_id, request: p.request }));

  if (
    !deepEqual(
      getPlayersRequesting(currentState),
      getPlayersRequesting(newData),
    )
  ) {
    return newData.players.filter((p) => p.request);
  } else {
    return [];
  }
};

export const setGameState =
  (newData: Data): AppThunk =>
  (dispatch, getState) => {
    const currentState = getState().gameManager.gameData;

    checkAndDispatchPlayersRequested(newData, currentState, dispatch);
    checkAndDispatchLastSet(newData, currentState, dispatch);
    checkAndDispatchNewPlayer(newData, currentState, dispatch);

    dispatch(setGameData(newData));
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
    const notificationId = Date.now();

    dispatch(showNotification({ id: notificationId, message }));

    setTimeout(() => {
      dispatch(hideNotification(notificationId));
    }, 6000);
  };
