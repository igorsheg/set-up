import { createSlice } from "@reduxjs/toolkit";

export const appSettingsSlice = createSlice({
  name: "appSettings",
  initialState: {
    soundEnabled: true,
  },
  reducers: {
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
    },
  },
});

export const { toggleSound } = appSettingsSlice.actions;
