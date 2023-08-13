import Board from "@components/Board/Board";
import Join from "@components/Join/Join";
import React from "react";
import { useParams } from "react-router-dom";
import { Card, Data, Move, Player } from "src/types";

const ws = new WebSocket(`ws://${import.meta.env.VITE_BACKEND_URL}/ws`);

export default function Game() {
  const [selected, setSelected] = React.useState<Card[]>([]);
  const [data, setData] = React.useState<Data>({} as Data);

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

  React.useEffect(() => {
    ws.onopen = (): void => { };

    ws.onmessage = (msg): void => {
      const currentState = JSON.parse(msg.data);
      setData(currentState);
      console.log("data", msg.data);

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
  }, [data, prevState.in_play]);

  const handleJoin = (name: string): void => {
    ws.send(
      JSON.stringify({
        type: "join",
        payload: {
          room_code: "psuWcr",
          name,
        },
      }),
    );
  };

  const handleMove = (cards: Card[]): void => {
    const move: Move = { cards };
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
    <div className="app">
      {data.in_play ? (
        <Board
          data={data}
          handleMove={handleMove}
          handleRequest={handleRequest}
          selected={selected}
          setSelected={setSelected}
        />
      ) : (
        <Join handleJoin={handleJoin} />
      )}
    </div>
  );
}
