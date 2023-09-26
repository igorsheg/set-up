import { createEffect, createEvent } from "effector";
import { GameMode } from "@types";
import { $roomManager, setActiveRoom } from "@store/roomManager";
import { resetGameData } from "@store/gameManager";
import { useStore } from "effector-react";

const createNewRoom = createEffect(async (mode: GameMode) => {
  const response = await fetch(`/api/new?mode=${mode}`);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return await response.json();
});

const checkRoomExists = createEffect(async (roomCode: string) => {
  const res = await fetch(`/api/game/${roomCode}`, {
    credentials: "include",
  });
  if (res.status !== 200) {
    throw new Error(`Room does not exist! Status: ${res.status}`);
  }
  return true;
});

const getPastRooms = createEffect(async () => {
  const res = await fetch(`/api/games`, {
    credentials: "include",
  });
  const rooms = await res.json();
  return rooms || [];
});

const joinRoomEvent = createEvent<{
  roomCode: string;
  playerUsername: string;
}>();

const leaveRoomEvent = createEvent();

leaveRoomEvent.watch(() => {
  setActiveRoom(null);
  resetGameData();
});

export const createNewRoomAndJoin = createEffect<
  {
    mode: GameMode;
    playerUsername: string;
  },
  string
>(async ({ mode, playerUsername }) => {
  const roomCode = await createNewRoom(mode);
  joinRoomEvent({ roomCode, playerUsername });
  setActiveRoom({
    code: roomCode,
    username: playerUsername,
  });
  return roomCode;
});

export function useRoomManager() {
  const { activeRoom, pastRooms } = useStore($roomManager);

  const joinRoom = (roomCode: string, playerUsername: string) => {
    joinRoomEvent({ roomCode, playerUsername });
  };

  return {
    activeRoom,
    pastRooms,
    joinRoom,
    createNewRoom,
    checkRoomExists,
    getPastRooms,
    setActiveRoom,
    createNewRoomAndJoin,
    leaveRoom: () => leaveRoomEvent(),
  };
}
