import {
  createEffect,
  createEvent,
  createStore,
  forward,
  sample,
} from "effector";
import { Data, GameAction } from "@types";
import { $gameManager, setGameData } from "./gameManager";
import { $hasClientId } from "./cookie";

export type WebSocketStatus = "IDLE" | "CONNECTING" | "OPEN" | "CLOSED";
const RECONNECT_TIMEOUT = 3000;
const MAX_RETRIES = 5;

const WEBSCOKET_URL = new URL("/api/ws", window.location.href);
WEBSCOKET_URL.protocol = WEBSCOKET_URL.protocol.replace("http", "ws");

export const $wsSocket = createStore<WebSocket | null>(null);
export const $webSocketStatus = createStore<WebSocketStatus>("IDLE");
export const $receivedMessages = createStore<Data>({} as Data);
export const $retryCount = createStore<number>(0);

export const setWebSocket = createEvent<WebSocket | null>();
export const closeWebSocket = createEvent();
export const openWebSocket = createEvent();
export const messageReceived = createEvent<Data>();
export const sendAction = createEvent<GameAction>();
export const increaseRetryCount = createEvent<void>();

export const initializeWebSocket = createEffect<void, void, Error>({
  handler: () => {
    const socket = new WebSocket(WEBSCOKET_URL.href);

    socket.onopen = () => {
      setWebSocket(socket);
      openWebSocket();
    };
    socket.onerror = (err) => {
      console.error("ws error", err);
    };
    socket.onclose = () => {
      setWebSocket(null);
      closeWebSocket();
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

export const delayEffect = createEffect<void, void, Error>({
  handler: () =>
    new Promise<void>((resolve) =>
      setTimeout(() => resolve(), RECONNECT_TIMEOUT),
    ),
});

$wsSocket.on(setWebSocket, (_, socket) => socket);
$webSocketStatus.on(closeWebSocket, () => "CLOSED");
$webSocketStatus.on(openWebSocket, () => "OPEN");
$retryCount.on(increaseRetryCount, (count) => count + 1);
$retryCount.on(openWebSocket, () => 0);

sample({
  source: $gameManager,
  clock: messageReceived,
  fn: (_currentGameData, newGameData) => newGameData,
  target: setGameData,
  filter: (source, clock) =>
    JSON.stringify(source.gameData.in_play) !== JSON.stringify(clock.in_play) ||
    JSON.stringify(source.gameData.players) !== JSON.stringify(clock.players),
});

sample({
  source: $retryCount,
  clock: closeWebSocket,
  fn: () => {
    increaseRetryCount();
  },
  target: delayEffect,
  filter: (source) => source <= MAX_RETRIES,
});

sample({
  clock: delayEffect.done,
  target: initializeWebSocket,
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

$hasClientId.watch((hasClientId) => {
  if (hasClientId) {
    initializeWebSocket();
  }
});
