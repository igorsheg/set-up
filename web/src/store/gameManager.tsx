import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Data, GameMode, Event } from "@types";
import dynamicIconImports from "lucide-react/dynamicIconImports";

export type NotificationMessage = {
  content: string;
  icon: keyof typeof dynamicIconImports;
  timestamp: string;
};

export type GameManagerState = {
  gameData: Data;
  selectedCardIndexes: number[];
  eventLog: Event[];
  activeNotifications: NotificationMessage[];
};

export const gameManagerSlice = createSlice({
  name: "gameManager",
  initialState: {
    gameData: {
      last_player: null,
      last_set: null,
      players: [],
      mode: GameMode.Classic,
      events: [],
    } as Data,
    selectedCardIndexes: [],
    eventLog: [],
    activeNotifications: [],
  } as GameManagerState,
  reducers: {
    setGameData: (state, action: PayloadAction<Data>) => {
      state.gameData = action.payload;
    },
    addSelectedCard: (state, action: PayloadAction<number>) => {
      state.selectedCardIndexes.push(action.payload);
    },
    removeSelectedCard: (state, action: PayloadAction<number>) => {
      const index = state.selectedCardIndexes.indexOf(action.payload);
      if (index > -1) {
        state.selectedCardIndexes.splice(index, 1);
      }
    },
    setEventLog: (state, action: PayloadAction<Event[]>) => {
      state.eventLog = action.payload;
    },

    clearSelectedCards: (state) => {
      state.selectedCardIndexes = [];
    },
    resetGameData: (state) => {
      state.gameData = {
        last_player: null,
        last_set: null,
        players: [],
        mode: GameMode.Classic,
        events: [],
      };
      state.selectedCardIndexes = [];
    },
    addNotification: (state, action: PayloadAction<NotificationMessage>) => {
      state.activeNotifications.push(action.payload);
      if (state.activeNotifications.length > 2) {
        state.activeNotifications.shift(); // Remove the oldest one
      }
    },
    clearNotification: (state) => {
      state.activeNotifications.shift(); // Remove the oldest one
    },
  },
});
