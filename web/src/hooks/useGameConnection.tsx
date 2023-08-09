import { useEffect, useRef, useState } from "react";
import { Card, GameSession, Move } from "../types/internal";

export const useGameConnection = (wsUrl: string) => {
  console.log("Websocket Url -->", wsUrl);
  const ws = new WebSocket(wsUrl);

  const [selected, setSelected] = useState<Card[]>([]);
  const [data, setData] = useState<GameSession>({} as GameSession);

  const prevState = usePrevious(data); // prevState of Data

  useEffect(() => {
    ws.onopen = () => {
      console.log("Connected to server");
    };

    ws.onmessage = (msg) => {
      const currentState = JSON.parse(msg.data);
      console.log("Current state: ", currentState);
      // setData(currentState);

      // If the in_play cards have changed, deselect any cards for the client
      if (
        JSON.stringify(prevState.in_play) !==
        JSON.stringify(currentState.in_play)
      ) {
        setSelected([]);
      }
    };

    ws.onclose = () => {
      alert("Disconnected from server");
      window.location.reload();
    };
  }, [data, prevState.in_play]);

  const handleJoin = (name: string) => {
    ws.send(
      JSON.stringify({
        type: "JoinSession",
        payload: {
          name,
        },
      }),
    );
  };

  const handleMove = (cards: Card[]) => {
    const move: Move = { cards };
    ws.send(
      JSON.stringify({
        type: "move",
        payload: move,
      }),
    );
  };

  const handleRequest = () => {
    ws.send(
      JSON.stringify({
        type: "request",
      }),
    );
  };

  const handleNew = () => {
    ws.send(
      JSON.stringify({
        type: "new",
      }),
    );
  };

  return {
    selected,
    setSelected,
    data,
    handleJoin,
    handleMove,
    handleRequest,
    handleNew,
  };
};

// Custom hook to keep track of the previous state of Data
const usePrevious = (value: GameSession) => {
  const ref = useRef({} as GameSession);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
