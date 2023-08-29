import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Card, Data, GameMode } from "@types";
import { LucideIcon } from "lucide-react";

export type NotificationMessage = {
  content: string;
  icon: LucideIcon;
};

export type GameManagerState = {
  gameData: Data;
  selectedCards: Card[];
  notifications: {
    active: boolean;
    message: NotificationMessage;
    timer?: number | undefined;
  }[];
};

export const gameManagerSlice = createSlice({
  name: "gameManager",
  initialState: {
    gameData: {
      last_player: null,
      last_set: null,
      players: [],
      mode: GameMode.Classic,
    } as Data,
    selectedCards: [],
    notifications: [],
  } as GameManagerState,
  reducers: {
    setGameData: (state, action: PayloadAction<Data>) => {
      state.gameData = action.payload;
    },
    setSelectedCards: (state, action: PayloadAction<Card[]>) => {
      state.selectedCards = action.payload;
    },
    resetGameData: (state) => {
      state.gameData = {
        last_player: null,
        last_set: null,
        players: [],
        mode: GameMode.Classic,
      };
      state.selectedCards = [];
    },
    showNotification: (state, action: PayloadAction<NotificationMessage>) => {
      const newNotification = {
        active: true,
        message: action.payload,
        timer: undefined,
      };
      state.notifications.push(newNotification);
    },
    hideNotification: (state, action: PayloadAction<number>) => {
      if (state.notifications[action.payload]?.timer) {
        clearTimeout(state.notifications[action.payload].timer);
      }
      state.notifications.splice(action.payload, 1);
    },
    setNotificationTimer: (
      state,
      action: PayloadAction<{
        index: number;
        timer: ReturnType<typeof setTimeout>;
      }>,
    ) => {
      if (state.notifications[action.payload.index]) {
        state.notifications[action.payload.index].timer = action.payload.timer;
      }
    },
  },
});
