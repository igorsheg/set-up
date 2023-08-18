import { useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();

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

  const joinGameHanlder = async () => {
    await ensureClientIdCookie();
    try {
      const newGameReq = await fetch(
        `http://${import.meta.env.VITE_BACKEND_URL}/new`,
      );

      console.log("code", newGameReq);
      const code = await newGameReq.json();
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
