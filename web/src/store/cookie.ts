import { createEffect } from "effector";

const COOKIE_NAME = "client_id";

export const checkAndFetchInitEndpoint = createEffect(async () => {
  if (!document.cookie.split("; ").find((row) => row.startsWith(COOKIE_NAME))) {
    await fetch(`/api/auth`, {
      credentials: "include",
    });
  }
});
