import React, {
  useRef,
  useState,
  useEffect,
  createContext,
  PropsWithChildren,
  useContext,
} from "react";
import { Card, Data } from "../types";
import { usePrevious } from "./usePrevious";

// 1. Enum for Message Types
enum MessageType {
  JOIN = "join",
  MOVE = "move",
  REQUEST = "request",
  NEW = "new",
}

// 2. Interfaces for Payload Types
interface JoinPayload {
  room_code: string;
  player_username: string;
}

interface MovePayload {
  cards: Card[];
  room_code: string;
}

interface RequestPayload {
  room_code: string;
}

interface NewPayload { }

// 3. Union Type for Messages
type WebSocketMessage =
  | { type: MessageType.JOIN; payload: JoinPayload }
  | { type: MessageType.MOVE; payload: MovePayload }
  | { type: MessageType.REQUEST; payload: RequestPayload }
  | { type: MessageType.NEW; payload: NewPayload };

// 4. WebSocket Status
type WebSocketStatus = "IDLE" | "CONNECTING" | "OPEN" | "CLOSED";

// 5. Context Type
interface GameWebSocketContextType {
  status: WebSocketStatus;
  data: Data;
  selected: Card[];
  setSelected: React.Dispatch<React.SetStateAction<Card[]>>;
  handleJoin: () => void;
  handleMove: (cards: Card[]) => void;
  handleRequest: () => void;
  handleNew: () => void;
}

// 6. Create the context
const GameWebSocketContext = createContext<
  GameWebSocketContextType | undefined
>(undefined);

// 8. Hook to use the context
export const useGameWebSocket = () => {
  const context = useContext(GameWebSocketContext);
  if (!context) {
    throw new Error(
      "useGameWebSocket must be used within a GameWebSocketProvider",
    );
  }
  return context;
};

// 9. Provider component
interface GameWebSocketProviderProps {
  room_code: string;
  playerUsername: string;
}

export const GameWebSocketProvider: React.FC<
  PropsWithChildren<GameWebSocketProviderProps>
> = ({ children, room_code, playerUsername }) => {
  const [status, setStatus] = useState<WebSocketStatus>("IDLE");
  const [data, setData] = useState<Data>({} as Data);
  const [selected, setSelected] = useState<Card[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const prevState = usePrevious(data);

  useEffect(() => {
    setStatus("CONNECTING");
    const ws = new WebSocket(`ws://${import.meta.env.VITE_BACKEND_URL}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("OPEN");
    };

    ws.onmessage = (event) => {
      const receivedData: Data = JSON.parse(event.data);

      if (
        JSON.stringify(prevState.in_play) !==
        JSON.stringify(receivedData.in_play)
      ) {
        setSelected([]);
      }

      setData(receivedData);
    };

    ws.onclose = () => {
      setStatus("CLOSED");
    };

    return () => {
      wsRef.current?.close();
    };
  }, [room_code, playerUsername]);

  const handleJoin = () => {
    console.log("room_code", room_code);
    console.log("playerUsername", playerUsername);
    wsRef.current?.send(
      JSON.stringify({
        type: MessageType.JOIN,
        payload: {
          room_code,
          player_username: playerUsername,
        },
      }),
    );
  };

  const handleMove = (cards: Card[]) => {
    wsRef.current?.send(
      JSON.stringify({
        type: MessageType.MOVE,
        payload: { cards, room_code },
      }),
    );
  };

  const handleRequest = () => {
    wsRef.current?.send(
      JSON.stringify({
        type: MessageType.REQUEST,
        payload: { room_code },
      }),
    );
  };

  const handleNew = () => {
    wsRef.current?.send(JSON.stringify({ type: MessageType.NEW }));
  };

  return (
    <GameWebSocketContext.Provider
      value={{
        status,
        data,
        selected,
        setSelected,
        handleJoin,
        handleMove,
        handleRequest,
        handleNew,
      }}
    >
      {children}
    </GameWebSocketContext.Provider>
  );
};
