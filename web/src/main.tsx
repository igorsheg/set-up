import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { StyleWrapper } from "@styles/ThemeProvider.tsx";
import "@styles/global.css";
import {
  createBrowserRouter,
  RouterProvider,
  useParams,
} from "react-router-dom";
import Game from "@routes/game.tsx";
import { GameWebSocketProvider } from "./hooks/useGameSocket.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/game/:room_code",
    element: <GameRouteWrapper />,
  },
]);

function GameRouteWrapper() {
  const { room_code } = useParams();

  if (!room_code) {
    return <div>Error: Room code is missing!</div>;
  }

  return (
    <GameWebSocketProvider room_code={room_code} playerUsername="player1">
      <Game />
    </GameWebSocketProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StyleWrapper>
      <RouterProvider router={router} />
    </StyleWrapper>
  </React.StrictMode>,
);
