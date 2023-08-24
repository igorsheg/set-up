import React from "react";
import ReactDOM from "react-dom/client";
import "@styles/global.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Game from "@routes/Game/Game.tsx";
import { Provider } from "react-redux";
import "@styles/index.css.ts";
import RootLayout from "@routes/Root.tsx";
import Lobby from "@routes/Lobby/Lobby.tsx";
import { store } from "@store/index";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "/", element: <Lobby /> },
      { path: "/game/:room_code", element: <Game /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);
