import { createStore, sample } from "effector";
import { createEvent, createEffect } from "effector";
import { JoinGameAction, MessageType } from "@types";
import { $wsSocket } from "./websocket";

export type ActiveRoom = {
  code: string;
  username: string;
};

export type RoomManagerState = {
  pastRooms: string[];
  activeRoom: ActiveRoom | null;
};

export const $roomManager = createStore<RoomManagerState>({
  activeRoom: null,
  pastRooms: [],
});

export const setActiveRoom = createEvent<ActiveRoom | null>();

$roomManager.on(setActiveRoom, (state, payload) => ({
  ...state,
  activeRoom: payload,
}));

export const joinGame = createEffect<JoinGameAction["payload"] | null, void>(
  (payload) => {
    $wsSocket
      .getState()
      ?.send(JSON.stringify({ type: MessageType.JOIN, payload }));
  },
);

sample({
  source: $roomManager,
  clock: setActiveRoom,
  fn: (_state, payload) =>
    payload
      ? { player_username: payload.username, room_code: payload.code }
      : null,
  target: joinGame,
});
