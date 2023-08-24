import { Action, ThunkAction, configureStore } from "@reduxjs/toolkit";
import { webSocketMiddleware } from "./websocket";
import { roomMangerSlice } from "./roomManager";
import { gameManagerSlice } from "./gameManager";
import { cookieMiddleware } from "./cookie";

export const store = configureStore({
  reducer: {
    gameManager: gameManagerSlice.reducer,
    roomManager: roomMangerSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(webSocketMiddleware, cookieMiddleware),
});

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export const { setActiveRoom, setWebsocketStatus } = roomMangerSlice.actions;

export const {
  setGameData,
  setSelectedCards,
  showNotification,
  hideNotification,
  setNotificationTimer,
} = gameManagerSlice.actions;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;