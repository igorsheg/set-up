import { Middleware, MiddlewareAPI } from "@reduxjs/toolkit";

const COOKIE_NAME = "client_id";

const checkAndFetchInitEndpoint = async () => {
  if (!document.cookie.split("; ").find((row) => row.startsWith(COOKIE_NAME))) {
    await fetch(`/api/auth`, {
      credentials: "include",
    });
  }
};

export const cookieMiddleware: Middleware =
  (_storeAPI: MiddlewareAPI) => (next) => async (action) => {
    await checkAndFetchInitEndpoint();
    return next(action);
  };
