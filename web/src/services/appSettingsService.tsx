import { $appSettings, toggleSound } from "@store/app";
import { useStore } from "effector-react";

export function useAppSettings() {
  const appSettings = useStore($appSettings);

  return {
    ...appSettings,
    toggleSound,
  };
}
