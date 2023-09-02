import { Action, ThunkAction, configureStore } from "@reduxjs/toolkit";
import { webSocketMiddleware } from "./websocket";
import { roomMangerSlice } from "./roomManager";
import { gameManagerSlice } from "./gameManager";
import { cookieMiddleware } from "./cookie";
import { appSettingsSlice } from "./app";
import { audioMiddleware } from "./audio";

export const store = configureStore({
  reducer: {
    gameManager: gameManagerSlice.reducer,
    roomManager: roomMangerSlice.reducer,
    appSettings: appSettingsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      webSocketMiddleware,
      cookieMiddleware,
      audioMiddleware,
    ),
});

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export const { setActiveRoom, setWebsocketStatus } = roomMangerSlice.actions;

export const {
  resetGameData,
  setGameData,
  addSelectedCard,
  removeSelectedCard,
  // setSelectedCards,
  showNotification,
  hideNotification,
  clearSelectedCards,
} = gameManagerSlice.actions;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
