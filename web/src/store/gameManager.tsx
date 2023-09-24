import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Data, GameMode, Event, Timestamp } from "@types";

const MAX_ACTIVE_NOTIFICATIONS = 1;

class RingBuffer<T> {
  private buffer: Array<T | undefined>;
  private size: number;
  private next = 0;

  constructor(size: number) {
    this.buffer = new Array<T | undefined>(size);
    this.size = size;
  }

  add(item: T): void {
    this.buffer[this.next] = item;
    this.next = (this.next + 1) % this.size;
  }

  toArray(): Array<T> {
    return this.buffer.filter((item): item is T => item !== undefined);
  }
}

const notificationBuffer = new RingBuffer<NotificationMessage>(
  MAX_ACTIVE_NOTIFICATIONS,
);

export type NotificationMessage = {
  content: string;
  icon: string;
  timestamp: Timestamp;
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
      in_play: [],
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
        in_play: [],
        mode: GameMode.Classic,
        events: [],
      };
      state.selectedCardIndexes = [];
    },
    addNotification: (state, action: PayloadAction<NotificationMessage>) => {
      notificationBuffer.add(action.payload);
      state.activeNotifications = notificationBuffer.toArray();
    },
  },
});
