import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { getPastRooms } from "@services/roomService";
import { WebSocketStatus } from "./websocket";

export type ActiveRoom = {
  code: string;
  username: string;
};
export type RoomManagerState = {
  webSocketStatus: WebSocketStatus;
  pastRooms: string[];
  activeRoom: ActiveRoom | null;
};

export const roomMangerSlice = createSlice({
  name: "roomManager",
  initialState: {
    activeRoom: {} as ActiveRoom,
    webSocketStatus: "IDLE",
    pastRooms: [],
  } as RoomManagerState,
  reducers: {
    setActiveRoom: (state, action: PayloadAction<ActiveRoom | null>) => {
      state.activeRoom = action.payload;
    },
    setWebsocketStatus: (state, action: PayloadAction<WebSocketStatus>) => {
      state.webSocketStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getPastRooms.fulfilled, (state, action) => {
      state.pastRooms = action.payload;
    });
  },
});

export const { setActiveRoom, setWebsocketStatus } = roomMangerSlice.actions;
