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
    id: number;
    active: boolean;
    message: NotificationMessage;
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
    showNotification: (
      state,
      action: PayloadAction<{ id: number; message: NotificationMessage }>,
    ) => {
      const newNotification = {
        id: action.payload.id,
        active: true,
        message: action.payload.message,
      };
      state.notifications.push(newNotification);
    },
    hideNotification: (state, action: PayloadAction<number>) => {
      const index = state.notifications.findIndex(
        (n) => n.id === action.payload,
      );
      if (index > -1) {
        state.notifications.splice(index, 1);
      }
    },
  },
});
