import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MessageType, setRoomCode } from "./store";

export default function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const ensureClientIdCookie = async () => {
    try {
      // Make a GET request to /init to ensure the client_id cookie is set.
      await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/init`, {
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to ensure client_id cookie:", err);
    }
  };

  useEffect(() => {
    ensureClientIdCookie();
  }, []);

  const joinGameHanlder = async () => {
    await ensureClientIdCookie();
    try {
      const newGameReq = await fetch(
        `http://${import.meta.env.VITE_BACKEND_URL}/new`,
      );
      const room_code = await newGameReq.json();
      dispatch(setRoomCode(room_code));
      dispatch({
        type: MessageType.JOIN,
        payload: { room_code, player_username: "player1" },
      });
      navigate(`/game/${room_code}`);
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
