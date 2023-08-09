import { GameSession, Player } from "./types/internal";
import { useGameConnection } from "./hooks/useGameConnection";
import Board from "@components/Board/Board";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();

  const joinGameHanlder = async () => {
    try {
      const newGameReq = await fetch(
        `http://${import.meta.env.VITE_BACKEND_URL}/start-match`,
      );

      let code = await newGameReq.json();
      navigate(`/game/${code}`);
    } catch (err) {
      console.log("failed to start match", err);
    }
  };

  return (
    <>
      <h1>hello</h1>
      <button onClick={joinGameHanlder}>Join Game</button>
    </>
  );
}
