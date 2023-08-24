import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppThunk } from "@store/index";
import { setActiveRoom } from "@store/roomManager";
import { JoinGameAction, MessageType } from "@store/websocket";

export const createNewRoom = createAsyncThunk<string, void>(
  "game/createNewRoom",
  async (_, _thunkAPI) => {
    try {
      const response = await fetch(`/api/new`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const room_code: string = await response.json();
      return room_code;
    } catch (error) {
      console.error("Failed to create a new room:", error);
      throw error;
    }
  },
);

export const checkRoomExists = createAsyncThunk<
  boolean,
  string,
  { rejectValue: boolean }
>("game/checkRoomExists", async (roomCode, _thunkAPI) => {
  const res = await fetch(`/api/game/${roomCode}`, {
    credentials: "include",
  });

  if (res.status === 200) {
    return true;
  } else {
    return _thunkAPI.rejectWithValue(false);
  }
});

export const joinRoom =
  (roomCode: string, playerUsername: string): AppThunk =>
  (dispatch) => {
    dispatch(setActiveRoom(roomCode));

    const joinAction: JoinGameAction = {
      type: MessageType.JOIN,
      payload: {
        room_code: roomCode,
        player_username: playerUsername,
      },
    };
    dispatch(joinAction);
  };

export const getPastRooms = createAsyncThunk<
  string[],
  void,
  { rejectValue: boolean }
>("game/getPastRooms", async (_, _thunkAPI) => {
  const res = await fetch(`/api/games`, {
    credentials: "include",
  });
  const rooms: string[] = await res.json();

  if (!rooms || !rooms.length) {
    return _thunkAPI.rejectWithValue(false);
  }
  return rooms;
});