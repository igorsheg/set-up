import { createEffect, createEvent } from "effector";
import { GameMode } from "@types";
import { setActiveRoom } from "@store/roomManager";
import { resetGameData } from "@store/gameManager";

export const createNewRoom = createEffect(async (mode: GameMode) => {
  try {
    const response = await fetch(`/api/new?mode=${mode}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const room_code: string = await response.json();
    return room_code;
  } catch (error) {
    console.error("Failed to create a new room:", error);
    throw error;
  }
});

export const checkRoomExists = createEffect(async (roomCode: string) => {
  const res = await fetch(`/api/game/${roomCode}`, {
    credentials: "include",
  });

  if (res.status !== 200) {
    throw new Error(`Room does not exist! Status: ${res.status}`);
  }
  return true;
});

export const getPastRooms = createEffect(async () => {
  const res = await fetch(`/api/games`, {
    credentials: "include",
  });
  const rooms: string[] = await res.json();

  if (!rooms || !rooms.length) {
    return [];
  }
  return rooms;
});

export const joinRoom = createEvent<{
  roomCode: string;
  playerUsername: string;
}>();

export const leaveRoom = createEvent();

leaveRoom.watch(() => {
  setActiveRoom(null);
  resetGameData();
});
