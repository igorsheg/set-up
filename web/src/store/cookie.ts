import { createEffect, createEvent, createStore } from "effector";

const COOKIE_NAME = "client_id";

export const $hasClientId = createStore<boolean>(false);
export const setCookie = createEvent<boolean>();

export const auth = createEffect(async () => {
  if (!document.cookie.split("; ").find((row) => row.startsWith(COOKIE_NAME))) {
    await fetch(`/api/auth`, {
      credentials: "include",
    });
  }
  setCookie(true);
});

$hasClientId.on(setCookie, (_, payload) => payload);
