import { Middleware, MiddlewareAPI } from "@reduxjs/toolkit";
import { RootState } from ".";

const selectSound = new Audio("/sfx/navigation_forward-selection-minimal.wav");
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

    if (action.type === "join") {
      playSound(newGame);
    }

    return next(action);
  };