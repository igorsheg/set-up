import { $appSettings } from "./app";
import {
  addSelectedCard,
  removeSelectedCard,
  setEventLog,
} from "./gameManager";
import { joinGame } from "./roomManager";

export const selectSound = new Audio(
  "/sfx/navigation_forward-selection-minimal.wav",
);
export const notificationSound = new Audio("/sfx/notification_simple.wav");
export const unSelectSound = new Audio(
  "/sfx/navigation_backward-selection-minimal.wav",
);
export const newGame = new Audio("/sfx/navigation_forward-selection.wav");

export const playSound = (audio: HTMLAudioElement) => {
  audio.currentTime = 0;
  audio.play();
};

joinGame.watch(() => {
  if ($appSettings.getState().soundEnabled) {
    playSound(newGame);
  }
});

addSelectedCard.watch(() => {
  if ($appSettings.getState().soundEnabled) {
    playSound(selectSound);
  }
});

removeSelectedCard.watch(() => {
  if ($appSettings.getState().soundEnabled) {
    playSound(unSelectSound);
  }
});

setEventLog.watch((events) => {
  if ($appSettings.getState().soundEnabled) {
    const last = events[events.length - 1];
    if (last) {
      const givenTimeInSeconds =
        last.timestamp.secs_since_epoch +
        last.timestamp.nanos_since_epoch / 1e9;

      const currentTimeInSeconds = Date.now() / 1000;
      const difference = Math.abs(currentTimeInSeconds - givenTimeInSeconds);
      const tolerance = 1;
      const isNow = difference <= tolerance;

      if (isNow && last.event_type === "PlayerFoundSet") {
        playSound(notificationSound);
      }
    }
  }
});
