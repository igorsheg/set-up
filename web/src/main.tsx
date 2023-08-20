import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { StyleWrapper } from "@styles/ThemeProvider.tsx";
import "@styles/global.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Game from "@routes/game.tsx";
import { Provider } from "react-redux";
import { store } from "./store.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/game/:room_code",
    element: <Game />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <StyleWrapper>
        <RouterProvider router={router} />
      </StyleWrapper>
    </Provider>
  </React.StrictMode>,
);
