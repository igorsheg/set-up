import React from "react";
import ReactDOM from "react-dom/client";
import "@styles/global.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Game from "@routes/Game/Game.tsx";
import "@styles/index.css.ts";
import RootLayout from "@routes/Root.tsx";
import Lobby from "@routes/Lobby/Lobby.tsx";
import { SplashScreenWrapper } from "@components/Splash/SplashScreen";
import { auth } from "@store/cookie";

auth();

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: (
          <SplashScreenWrapper>
            <Lobby />
          </SplashScreenWrapper>
        ),
      },
      { path: "/game/:room_code", element: <Game /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
