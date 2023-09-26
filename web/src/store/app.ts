import { createEvent, createStore } from "effector";

const initialAppState = {
  soundEnabled: true,
};

export const $appSettings = createStore(initialAppState);

export const toggleSound = createEvent();

$appSettings.on(toggleSound, (state) => ({
  ...state,
  soundEnabled: !state.soundEnabled,
}));
