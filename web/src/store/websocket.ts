import { Middleware, MiddlewareAPI } from "@reduxjs/toolkit";
import { Card, Data } from "@types";
import { AppDispatch, RootState, setWebsocketStatus } from ".";
import { setGameState } from "@services/gameService";

let retryCount = 0;
const maxRetry = 5;
const maxDelay = 30000;
let userRequestedClose = false;

const retryConnection = (storeAPI: MiddlewareAPI<AppDispatch>) => {
  if (retryCount < maxRetry) {
    const retryInterval = Math.min(
      maxDelay,
      (Math.pow(2, retryCount) - 1) * 1000,
    );

    setTimeout(() => {
      initializeWebSocket(storeAPI);

      retryCount++;
    }, retryInterval);
  } else {
    console.error("Failed to connect to WebSocket server.");
  }
};

export type WebSocketStatus = "IDLE" | "CONNECTING" | "OPEN" | "CLOSED";

export enum MessageType {
  JOIN = "join",
  MOVE = "move",
  REQUEST = "request",
  NEW = "new",
  INIT = "init",
  CLOSE = "close",
  RESET = "reset",
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
export interface ResetGameAction {
  type: MessageType.RESET;
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
  | CloseWebSocketAction
  | ResetGameAction;

export let ws: WebSocket | null = null;

export const simulateUnintentionalDisconnect = () => {
  setTimeout(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  }, Math.random() * 10000);
};

const connectWebSocket = (storeAPI: MiddlewareAPI<AppDispatch>) => {
  const url = new URL("/api/ws", window.location.href);
  url.protocol = url.protocol.replace("http", "ws");
  ws = new WebSocket(url);

  globalThis.addEventListener("beforeunload", function() {
    userRequestedClose = true;
    ws?.close();
  });

  ws.onopen = () => {
    storeAPI.dispatch(setWebsocketStatus("OPEN"));
    retryCount = 0;
  };

  ws.onmessage = (event) => {
    const receivedData: Data = JSON.parse(event.data);
    storeAPI.dispatch(setGameState(receivedData));
  };

  ws.onclose = () => {
    storeAPI.dispatch(setWebsocketStatus("CLOSED"));
    ws = null;

    if (!userRequestedClose) {
      retryConnection(storeAPI);
    } else {
      userRequestedClose = false;
    }
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
        userRequestedClose = true;
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
        case MessageType.RESET:
          ws.send(
            JSON.stringify({
              type: MessageType.RESET,
              payload: { room_code: activeRoom?.code },
            }),
          );
          break;
      }
    }
    return result;
  };
};
