import {
  configureStore,
  createSlice,
  PayloadAction,
  Middleware,
  MiddlewareAPI,
  createAsyncThunk,
  Action,
  ThunkAction,
} from "@reduxjs/toolkit";
import { Card, Data } from "./types";

export type WebSocketStatus = "IDLE" | "CONNECTING" | "OPEN" | "CLOSED";

export type GameState = {
  status: WebSocketStatus;
  data: Data;
  selected: Card[];
  roomCode: string | null;
  notifications: {
    show: boolean;
    message: string;
  };
  notificationTimer: ReturnType<typeof setTimeout> | null;
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
    room_code?: string;
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

type GameAction = JoinGameAction | MoveGameAction | RequestCardsAction;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export const moveCards =
  (cards: Card[]): AppThunk =>
  (dispatch, getState) => {
    dispatch(setSelected(cards));

    const {
      game: { roomCode },
    } = getState();

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: MessageType.MOVE,
          payload: { room_code: roomCode, cards },
        }),
      );
    }
  };

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

const initialState: GameState = {
  status: "IDLE",
  data: {} as Data,
  selected: [],
  roomCode: null,
  notifications: {
    show: false,
    message: "",
  },
  notificationTimer: null,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    reset: (state) => {
      state.data = {} as Data;
    },
    setStatus: (state, action: PayloadAction<WebSocketStatus>) => {
      state.status = action.payload;
    },
    setData: (state, action: PayloadAction<Data>) => {
      state.data = action.payload;
    },
    setSelected: (state, action: PayloadAction<Card[]>) => {
      state.selected = action.payload;
    },
    setRoomCode: (state, action: PayloadAction<string | null>) => {
      state.roomCode = action.payload;
    },
    showNotification: (state, action: PayloadAction<string>) => {
      state.notifications.show = true;
      state.notifications.message = action.payload;
    },
    hideNotification: (state) => {
      state.notifications.show = false;
      state.notifications.message = "";
    },
    setNotificationTimer: (
      state,
      action: PayloadAction<ReturnType<typeof setTimeout>>,
    ) => {
      if (state.notificationTimer) {
        clearTimeout(state.notificationTimer);
      }
      state.notificationTimer = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewRoom.fulfilled, (state, action) => {
        state.roomCode = action.payload;
      })
      .addCase(createNewRoom.rejected, (_state, action) => {
        console.error("Failed to create a new room:", action.error);
      });
  },
});

export const {
  setStatus,
  setData,
  setSelected,
  setRoomCode,
  showNotification,
  hideNotification,
  setNotificationTimer,
} = gameSlice.actions;

export const displayNotificationWithTimer =
  (message: string): AppThunk =>
  (dispatch, _getState) => {
    dispatch(showNotification(message));
    const timeoutId = setTimeout(() => {
      dispatch(hideNotification());
    }, 6000);

    dispatch(setNotificationTimer(timeoutId));
  };

const COOKIE_NAME = "client_id";

const checkAndFetchInitEndpoint = async () => {
  if (!document.cookie.split("; ").find((row) => row.startsWith(COOKIE_NAME))) {
    await fetch(`/api/auth`, {
      credentials: "include",
    });
  }
};

const cookieMiddleware: Middleware =
  (_storeAPI: MiddlewareAPI) => (next) => async (action) => {
    await checkAndFetchInitEndpoint();
    return next(action);
  };

let ws: WebSocket | null = null;
const RECONNECT_INTERVAL = 5000;

const connectWebSocket = (storeAPI: MiddlewareAPI) => {
  const url = new URL("/api/ws", window.location.href);
  url.protocol = url.protocol.replace("http", "ws");
  ws = new WebSocket(url);

  ws.onopen = () => {
    storeAPI.dispatch(setStatus("OPEN"));
  };
  ws.onmessage = (event) => {
    const receivedData: Data = JSON.parse(event.data);
    storeAPI.dispatch(setData(receivedData));
  };
  ws.onclose = () => {
    storeAPI.dispatch(setStatus("CLOSED"));
    setTimeout(() => connectWebSocket(storeAPI), RECONNECT_INTERVAL);
  };
  ws.onerror = (error) => console.error("WebSocket Error:", error);
};

const webSocketMiddleware: Middleware = (storeAPI: MiddlewareAPI) => {
  connectWebSocket(storeAPI);

  return (next) => (action: GameAction) => {
    const result = next(action);
    const {
      game: { roomCode },
    } = storeAPI.getState();

    if (ws && ws.readyState === WebSocket.OPEN) {
      switch (action.type) {
        case MessageType.JOIN:
          ws.send(
            JSON.stringify({ type: MessageType.JOIN, payload: action.payload }),
          );
          break;
        case MessageType.MOVE:
          ws.send(
            JSON.stringify({
              type: MessageType.MOVE,
              payload: { room_code: roomCode, cards: action.payload.cards },
            }),
          );
          break;
        case MessageType.REQUEST:
          ws.send(
            JSON.stringify({
              type: MessageType.REQUEST,
              payload: { room_code: roomCode },
            }),
          );
          break;
      }
    }
    return result;
  };
};

export const store = configureStore({
  reducer: { game: gameSlice.reducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(webSocketMiddleware, cookieMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
