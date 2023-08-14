import { useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();

  const joinGameHanlder = async () => {
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
