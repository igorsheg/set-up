import {
  configureStore,
  createSlice,
  PayloadAction,
  Middleware,
  MiddlewareAPI,
} from "@reduxjs/toolkit";
import { Card, Data } from "./types";

export type WebSocketStatus = "IDLE" | "CONNECTING" | "OPEN" | "CLOSED";

export type GameState = {
  status: WebSocketStatus;
  data: Data;
  selected: Card[];
  roomCode: string | null;
};

export enum MessageType {
  JOIN = "join",
  MOVE = "move",
  REQUEST = "request",
  NEW = "new",
}

export interface JoinGameAction {
  type: MessageType.JOIN;
  payload: {
    room_code: string;
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

const initialState: GameState = {
  status: "IDLE",
  data: {} as Data,
  selected: [],
  roomCode: null,
};

type GameAction = JoinGameAction | MoveGameAction | RequestCardsAction; // Add other action types if needed

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<WebSocketStatus>) => {
      state.status = action.payload;
    },
    setData: (state, action: PayloadAction<Data>) => {
      if (
        JSON.stringify(state.data.in_play) !==
        JSON.stringify(action.payload.in_play)
      ) {
        state.selected = [];
      }
      state.data = action.payload;
    },
    setSelected: (state, action: PayloadAction<Card[]>) => {
      state.selected = action.payload;
    },
    setRoomCode: (state, action: PayloadAction<string | null>) => {
      state.roomCode = action.payload;
    },
  },
});

export const { setStatus, setData, setSelected, setRoomCode } =
  gameSlice.actions;

let ws: WebSocket | null = null;

const initializeWebSocket = (storeAPI: MiddlewareAPI) => {
  if (ws === null) {
    ws = new WebSocket(`ws://${import.meta.env.VITE_BACKEND_URL}/ws`);

    ws.onopen = () => {
      storeAPI.dispatch(setStatus("OPEN"));
    };

    ws.onmessage = (event) => {
      const receivedData: Data = JSON.parse(event.data);
      console.log("WebSocket receivedData:", receivedData);
      storeAPI.dispatch(setData(receivedData));
    };

    ws.onclose = () => {
      storeAPI.dispatch(setStatus("CLOSED"));
      ws = null;
      // Logic to attempt reconnection can be added here
    };
  }
};

const webSocketMiddleware: Middleware = (storeAPI: MiddlewareAPI) => {
  // Initialize WebSocket immediately when middleware is invoked
  initializeWebSocket(storeAPI);

  return (next) => (action: GameAction) => {
    const currentRoomCode = storeAPI.getState().game.roomCode;
    const currentSelectedCards = storeAPI.getState().game.selected;

    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log("WebSocket action:", action);
      switch (action.type) {
        case MessageType.JOIN:
          ws.send(
            JSON.stringify({
              type: MessageType.JOIN,
              payload: {
                room_code: currentRoomCode,
                player_username: action.payload.player_username,
              },
            }),
          );
          break;
        case MessageType.MOVE:
          const message = {
            type: MessageType.MOVE,
            payload: {
              room_code: currentRoomCode,
              cards: currentSelectedCards,
            },
          };
          console.log("message", message);
          ws.send(JSON.stringify(message));
          break;
        case MessageType.REQUEST:
          ws.send(
            JSON.stringify({
              type: MessageType.REQUEST,
              payload: {
                room_code: currentRoomCode,
              },
            }),
          );
          break;
      }
    }
    return next(action);
  };
};

export const store = configureStore({
  reducer: {
    game: gameSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(webSocketMiddleware),
});
