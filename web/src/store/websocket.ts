import {
  createEffect,
  createEvent,
  createStore,
  forward,
  sample,
} from "effector";
import { Data, GameAction } from "@types";
import { setGameData } from "./gameManager";

export type WebSocketStatus = "IDLE" | "CONNECTING" | "OPEN" | "CLOSED";
const RECONNECT_TIMEOUT = 1000;

const WEBSCOKET_URL = new URL("/api/ws", window.location.href);
WEBSCOKET_URL.protocol = WEBSCOKET_URL.protocol.replace("http", "ws");

export const $wsSocket = createStore<WebSocket | null>(null);
export const $webSocketStatus = createStore<WebSocketStatus>("IDLE");
export const $receivedMessages = createStore<Data>({} as Data);

export const setWebSocket = createEvent<WebSocket | null>();
export const closeWebSocket = createEvent();
export const messageReceived = createEvent<Data>();
export const sendAction = createEvent<GameAction>();

export const initializeWebSocket = createEffect<void, void, Error>({
  handler: () => {
    const socket = new WebSocket(WEBSCOKET_URL.href);

    socket.onopen = () => {
      setWebSocket(socket);
    };
    socket.onerror = (err) => {
      console.error("ws error", err);
    };
    socket.onclose = () => {
      setWebSocket(null);
      setTimeout(() => initializeWebSocket(), RECONNECT_TIMEOUT);
    };
    socket.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        messageReceived(parsedData);
      } catch (err) {
        console.error("error message", err);
      }
    };
  },
});

$wsSocket.on(setWebSocket, (_, socket) => socket);
$webSocketStatus.on(initializeWebSocket.done, () => "OPEN");
$webSocketStatus.on(closeWebSocket, () => "CLOSED");

sample({
  clock: messageReceived,
  fn: (payload) => payload,
  target: setGameData,
});

forward({
  from: sendAction,
  to: createEffect<GameAction, void, Error>({
    handler: (action) => {
      const ws = $wsSocket.getState();
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(action));
      } else {
        console.error("WebSocket is not open");
      }
    },
  }),
});
