import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Game() {
  let { code } = useParams();

  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (code?.length) {
      const wsInstance = new WebSocket(
        `ws://${import.meta.env.VITE_BACKEND_URL}/game/${code}/ws`,
      );
      const message = {
        code,
        username: Math.random().toString(36).substring(7),
      };

      const payload = JSON.stringify({ JoinSession: message });
      wsInstance.onopen = () => {
        console.log("Connected to server");
        wsInstance.send(payload);
      };

      wsInstance.onclose = () => {
        console.log("Disconnected from server");
        // window.location.reload();
      };

      setWs(wsInstance);

      // Clean up function to close WebSocket when component is unmounted
      return () => wsInstance.close();
    }
  }, [code]);

  useEffect(() => {
    if (ws) {
      ws.onmessage = (msg) => {
        const currentState = JSON.parse(msg.data);
        console.log("Current state: ", currentState);
      };
    }
  }, [ws]);

  return (
    <>
      <h2>Game</h2>
      <p>Code: {code}</p>
    </>
  );
}
