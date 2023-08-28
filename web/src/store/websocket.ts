import { Middleware, MiddlewareAPI } from "@reduxjs/toolkit";
import { Card, Data } from "@types";
import { AppDispatch, RootState, setWebsocketStatus } from ".";
import { setGameState } from "@services/gameService";

export type WebSocketStatus = "IDLE" | "CONNECTING" | "OPEN" | "CLOSED";

export enum MessageType {
  JOIN = "join",
  MOVE = "move",
  REQUEST = "request",
  NEW = "new",
  INIT = "init",
  CLOSE = "close",
}

export interface JoinGameAction {
  type: MessageType.JOIN;
  payload: {
    room_code?: string;
    player_username: string;
  };
}

export interface MoveGameAction {
  type: MessageType.MOVE;
  payload: {
    room_code: string;
    cards: Card[];
  };
}

export interface RequestCardsAction {
  type: MessageType.REQUEST;
  payload: {
    room_code: string;
  };
}
export interface InitWebSocketAction {
  type: MessageType.INIT;
}
export interface CloseWebSocketAction {
  type: MessageType.CLOSE;
}

export type GameAction =
  | JoinGameAction
  | MoveGameAction
  | RequestCardsAction
  | InitWebSocketAction
  | CloseWebSocketAction;

export let ws: WebSocket | null = null;

const connectWebSocket = (storeAPI: MiddlewareAPI<AppDispatch>) => {
  const url = new URL("/api/ws", window.location.href);
  url.protocol = url.protocol.replace("http", "ws");
  ws = new WebSocket(url);

  ws.onopen = () => {
    storeAPI.dispatch(setWebsocketStatus("OPEN"));
  };
  ws.onmessage = (event) => {
    console.log("RECEIVED", event.data);
    const receivedData: Data = JSON.parse(event.data);
    storeAPI.dispatch(setGameState(receivedData));
  };
  ws.onclose = () => {
    storeAPI.dispatch(setWebsocketStatus("CLOSED"));
  };
  ws.onerror = (error) => console.error("WebSocket Error:", error);
};

export const initializeWebSocket = (storeAPI: MiddlewareAPI<AppDispatch>) => {
  if (ws === null) {
    connectWebSocket(storeAPI);
  }
};

export const webSocketMiddleware: Middleware = (storeAPI: MiddlewareAPI) => {
  return (next) => (action: GameAction) => {
    if (action.type === MessageType.INIT) {
      initializeWebSocket(storeAPI);
    }

    if (action.type === MessageType.CLOSE) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      ws = null;
    }

    const result = next(action);

    const {
      roomManager: { activeRoom },
    } = storeAPI.getState() as RootState;

    if (ws && ws.readyState === WebSocket.OPEN) {
      switch (action.type) {
        case MessageType.JOIN:
          ws.send(
            JSON.stringify({ type: MessageType.JOIN, payload: action.payload }),
          );
          break;
        case MessageType.MOVE:
          ws.send(
            JSON.stringify({
              type: MessageType.MOVE,
              payload: {
                room_code: activeRoom?.code,
                cards: action.payload.cards,
              },
            }),
          );
          break;
        case MessageType.REQUEST:
          ws.send(
            JSON.stringify({
              type: MessageType.REQUEST,
              payload: { room_code: activeRoom?.code },
            }),
          );
          break;
      }
    }
    return result;
  };
};
