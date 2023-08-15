import Board from "@components/Board/Board";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Data, Move, Player } from "src/types";
import * as styles from "./game.css";
import Pill from "@components/Pill/Pill";

export default function Game() {
  const [selected, setSelected] = React.useState<Card[]>([]);
  const [data, setData] = React.useState<Data>({} as Data);
  const { room_code } = useParams();
  const [ws, setWebSocket] = useState<WebSocket | null>(null);

  // Custom hook to keep track of the previous state of Data
  const usePrevious = (
    value: Data,
  ): React.MutableRefObject<Data>["current"] => {
    const ref = React.useRef({} as Data);
    React.useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };

  const prevState = usePrevious(data); // prevState of Data

  useEffect(() => {
    const newWebSocket = new WebSocket(
      `ws://${import.meta.env.VITE_BACKEND_URL}/ws`,
    );
    setWebSocket(newWebSocket);

    return () => {
      if (ws) {
        ws.close();
        setWebSocket(null);
      }
    };
  }, []);

  React.useEffect(() => {
    if (ws && room_code) {
      ws.onopen = (): void => {
        handleJoin(ws, room_code, "player1");
      };

      ws.onmessage = (msg): void => {
        console.log("data", msg);
        const currentState = JSON.parse(msg.data);
        setData(currentState);

        // If the in_play cards have changed, deselect any cards for the client
        if (
          JSON.stringify(prevState.in_play) !==
          JSON.stringify(currentState.in_play)
        ) {
          setSelected([]);
        }
      };

      ws.onclose = (): void => {
        alert("Disconnected from server"); // eslint-disable-line
        window.location.reload();
      };
    }
  }, [data, room_code, prevState.in_play, ws]);

  const handleJoin = (
    ws: WebSocket,
    room_code: string,
    playerUsername: string,
  ): void => {
    ws.send(
      JSON.stringify({
        type: "join",
        payload: {
          room_code,
          player_username: playerUsername,
        },
      }),
    );
  };

  const handleMove = (cards: Card[]): void => {
    const move: Move = { cards, room_code };
    console.log("move", move);
    ws.send(
      JSON.stringify({
        type: "move",
        payload: move,
      }),
    );
  };

  const handleRequest = (): void => {
    ws.send(
      JSON.stringify({
        type: "request",
        payload: { room_code },
      }),
    );
  };

  const handleNew = (): void => {
    ws.send(
      JSON.stringify({
        type: "new",
      }),
    );
  };

  if (data && data.game_over) {
    const highScore = Math.max(...data.players.map((p: Player) => p.score));
    const winners = data.players
      .filter((p: Player) => p.score === highScore)
      .map((p: Player) => p.name);

    return (
      <div className="app">
        <div className="game-over">
          <img width="100%" src="" alt="game-over" />
          <div>{`Winner: ${winners.join("& ")}`}</div>
          <button type="button" onClick={(): void => handleNew()}>
            Play again?
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gamePageStyles}>
      {data.in_play ? (
        <>
          <Board
            data={data}
            handleMove={handleMove}
            handleRequest={handleRequest}
            selected={selected}
            setSelected={setSelected}
          />
          <Pill game={data} />
        </>
      ) : (
        <div>Waiting for players</div>
      )}
    </div>
  );
}
