import { createEvent, createStore, sample } from "effector";
import { Data, GameMode, Event, NotificationMessage } from "@types";

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

export type GameManagerState = {
  gameData: Data;
  selectedCardIndexes: number[];
  activeNotifications: NotificationMessage[];
};

const initialGameData: Data = {
  last_player: null,
  last_set: [],
  players: [],
  mode: GameMode.Classic,
  events: [],
  in_play: [],
};

export const $gameManager = createStore<GameManagerState>({
  gameData: initialGameData,
  selectedCardIndexes: [],
  activeNotifications: [],
});
export const $previousEvents = createStore<Event[]>([]);

export const setGameData = createEvent<Data>();
export const addSelectedCard = createEvent<number>();
export const removeSelectedCard = createEvent<number>();
export const setEventLog = createEvent<Event[]>();
export const clearSelectedCards = createEvent<void>();
export const resetGameData = createEvent<void>();
export const addNotification = createEvent<NotificationMessage>();
export const displayNotificationWithTimer = createEvent<NotificationMessage>();
export const updatePreviousEvents = createEvent<Event[]>();
export const calculateNewEvents = createEvent<Event[]>();
const calculateNewEventsAndUpdatePrevious = createEvent<Event[]>();

$gameManager.on(setGameData, (state, payload) => ({
  ...state,
  gameData: payload,
}));

$gameManager.on(addSelectedCard, (state, cardIndex) => ({
  ...state,
  selectedCardIndexes: [...state.selectedCardIndexes, cardIndex],
}));

$gameManager.on(removeSelectedCard, (state, cardIndex) => ({
  ...state,
  selectedCardIndexes: state.selectedCardIndexes.filter(
    (index) => index !== cardIndex,
  ),
}));

$gameManager.on(setEventLog, (state, events) => ({
  ...state,
  eventLog: events,
}));

$gameManager.on(clearSelectedCards, (state) => ({
  ...state,
  selectedCardIndexes: [],
}));

$gameManager.on(resetGameData, (state) => ({
  ...state,
  gameData: initialGameData,
  selectedCardIndexes: [],
}));

$gameManager.on(addNotification, (state, notification) => {
  notificationBuffer.add(notification);
  return {
    ...state,
    activeNotifications: notificationBuffer.toArray(),
  };
});

$previousEvents.on(updatePreviousEvents, (_, events) => events);

sample({
  source: {
    previousEvents: $previousEvents,
    currentEvents: $gameManager.map((state) => state.gameData.events),
  },
  clock: setGameData,
  fn: ({ previousEvents, currentEvents }) => {
    const setPrevious = new Set(
      previousEvents.map((item) =>
        JSON.stringify([item.event_type, item.timestamp]),
      ),
    );
    const newEvents = currentEvents.filter(
      (item) =>
        !setPrevious.has(JSON.stringify([item.event_type, item.timestamp])),
    );

    return newEvents;
  },
  target: calculateNewEventsAndUpdatePrevious,
});

calculateNewEventsAndUpdatePrevious.watch((newEvents) => {
  updatePreviousEvents(newEvents);
  calculateNewEvents(newEvents);
});

calculateNewEvents.watch((newEvents) => {
  newEvents.forEach((event) => {
    switch (event.event_type) {
      case "PlayerJoined":
        displayNotificationWithTimer({
          timestamp: event.timestamp,
          content: `Player ${event.data} joined the game`,
          icon: "💬",
        });
        break;
      case "PlayerFoundSet":
        displayNotificationWithTimer({
          timestamp: event.timestamp,
          content: `${event.data}`,
          icon: "🎯",
        });
        break;
      case "PlayerRequestedCards":
        displayNotificationWithTimer({
          timestamp: event.timestamp,
          content: `${event.data} requested cards`,
          icon: "✋",
        });
        break;
      default:
        break;
    }
  });
});

displayNotificationWithTimer.watch((message) => {
  const notification = {
    ...message,
    id: Date.now(),
  };

  addNotification(notification);
});
