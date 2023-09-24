import { Middleware, MiddlewareAPI } from "@reduxjs/toolkit";
import { RootState } from ".";
import { Event } from "@types";

const selectSound = new Audio("/sfx/navigation_forward-selection-minimal.wav");
const notificationSound = new Audio("/sfx/notification_simple.wav");
const unSelectSound = new Audio(
  "/sfx/navigation_backward-selection-minimal.wav",
);

const newGame = new Audio("/sfx/navigation_forward-selection.wav");

export const audioMiddleware: Middleware =
  (store: MiddlewareAPI) => (next) => (action) => {
    const state = store.getState() as RootState;

    const playSound = (audio: HTMLAudioElement) => {
      audio.currentTime = 0;
      audio.play();
    };

    if (!state.appSettings.soundEnabled) {
      return next(action);
    }

    if (action.type === "gameManager/addSelectedCard") {
      playSound(selectSound);
    }
    if (action.type === "gameManager/removeSelectedCard") {
      playSound(unSelectSound);
    }
    if (action.type === "gameManager/setEventLog") {
      const last = action.payload[action.payload.length - 1] as Event;

      const givenTimeInSeconds =
        last.timestamp.secs_since_epoch +
        last.timestamp.nanos_since_epoch / 1e9;

      const currentTimeInSeconds = Date.now() / 1000;

      const difference = Math.abs(currentTimeInSeconds - givenTimeInSeconds);
      const tolerance = 1;
      const isNow = difference <= tolerance;

      if (isNow && last && last.event_type === "PlayerFoundSet") {
        playSound(notificationSound);
      }
    }

    if (action.type === "join") {
      playSound(newGame);
    }

    return next(action);
  };
