import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { createNewRoom, getPastRooms } from "@services/roomService";
import { WebSocketStatus } from "./websocket";

export type RoomManagerState = {
  activeRoom: string | null;
  webSocketStatus: WebSocketStatus;
  pastRooms: string[];
};

export const roomMangerSlice = createSlice({
  name: "roomManager",
  initialState: {
    activeRoom: null,
    webSocketStatus: "IDLE",
    pastRooms: [],
  } as RoomManagerState,
  reducers: {
    setActiveRoom: (state, action: PayloadAction<string | null>) => {
      state.activeRoom = action.payload;
    },
    setWebsocketStatus: (state, action: PayloadAction<WebSocketStatus>) => {
      state.webSocketStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewRoom.fulfilled, (state, action) => {
        state.activeRoom = action.payload;
      })
      .addCase(createNewRoom.rejected, (_state, action) => {
        console.error("Failed to create a new room:", action.error);
      })
      .addCase(getPastRooms.fulfilled, (state, action) => {
        state.pastRooms = action.payload;
      });
  },
});

export const { setActiveRoom, setWebsocketStatus } = roomMangerSlice.actions;
