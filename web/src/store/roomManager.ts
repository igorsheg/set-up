import { createStore, sample } from "effector";
import { createEvent, createEffect } from "effector";
import { JoinGameAction, MessageType } from "@types";
import { $webSocketStatus, $wsSocket } from "./websocket";

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
  source: {
    webSocketStatus: $webSocketStatus,
    activeRoom: $roomManager.map((state) => state.activeRoom),
  },
  clock: [setActiveRoom, $webSocketStatus],
  fn: ({ webSocketStatus, activeRoom }) => {
    if (webSocketStatus === "OPEN" && activeRoom) {
      return {
        player_username: activeRoom.username,
        room_code: activeRoom.code,
      };
    }
    return null;
  },
  target: joinGame,
  filter: (source) =>
    source.webSocketStatus === "OPEN" && source.activeRoom !== null,
});
