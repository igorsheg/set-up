import { Middleware, MiddlewareAPI } from "@reduxjs/toolkit";

const COOKIE_NAME = "client_id";
const API_URL = new URL("/api", import.meta.env.VITE_API_URL);

const checkAndFetchInitEndpoint = async () => {
  if (!document.cookie.split("; ").find((row) => row.startsWith(COOKIE_NAME))) {
    await fetch(`${API_URL}/auth`, {
      credentials: "include",
    });
  }
};

export const cookieMiddleware: Middleware =
  (_storeAPI: MiddlewareAPI) => (next) => async (action) => {
    await checkAndFetchInitEndpoint();
    return next(action);
  };
