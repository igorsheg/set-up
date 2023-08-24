import { Middleware, MiddlewareAPI } from "@reduxjs/toolkit";
import { Card, Data } from "@types";
import { AppDispatch, setWebsocketStatus } from ".";
import { setGameState } from "@services/gameService";

export type WebSocketStatus = "IDLE" | "CONNECTING" | "OPEN" | "CLOSED";

export enum MessageType {
  JOIN = "join",
  MOVE = "move",
  REQUEST = "request",
  NEW = "new",
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

export type GameAction = JoinGameAction | MoveGameAction | RequestCardsAction;
export let ws: WebSocket | null = null;
const RECONNECT_INTERVAL = 5000;

const connectWebSocket = (storeAPI: MiddlewareAPI<AppDispatch>) => {
  const url = new URL("/api/ws", window.location.href);
  url.protocol = url.protocol.replace("http", "ws");
  ws = new WebSocket(url);

  ws.onopen = () => {
    storeAPI.dispatch(setWebsocketStatus("OPEN"));
  };
  ws.onmessage = (event) => {
    const receivedData: Data = JSON.parse(event.data);
    storeAPI.dispatch(setGameState(receivedData));
  };
  ws.onclose = () => {
    storeAPI.dispatch(setWebsocketStatus("CLOSED"));
    setTimeout(() => connectWebSocket(storeAPI), RECONNECT_INTERVAL);
  };
  ws.onerror = (error) => console.error("WebSocket Error:", error);
};

export const webSocketMiddleware: Middleware = (storeAPI: MiddlewareAPI) => {
  connectWebSocket(storeAPI);

  return (next) => (action: GameAction) => {
    const result = next(action);
    const {
      roomManager: { activeRoom },
    } = storeAPI.getState();

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
              payload: { room_code: activeRoom, cards: action.payload.cards },
            }),
          );
          break;
        case MessageType.REQUEST:
          ws.send(
            JSON.stringify({
              type: MessageType.REQUEST,
              payload: { room_code: activeRoom },
            }),
          );
          break;
      }
    }
    return result;
  };
};
