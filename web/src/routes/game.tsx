import Board from "@components/Board/Board";
import * as styles from "./game.css";
import Pill from "@components/Pill/Pill";
import { useGameWebSocket } from "../hooks/useGameSocket";
import { Player } from "src/types";
import { useEffect } from "react";

export default function Game() {
  const {
    data,
    selected,
    setSelected,
    handleMove,
    handleRequest,
    handleNew,
    handleJoin,
    status,
  } = useGameWebSocket();

  useEffect(() => {
    if (status === "OPEN") {
      handleJoin();
    }
  }, [status]);

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
          <Pill handleRequest={handleRequest} game={data} />
        </>
      ) : (
        <div>Waiting for players</div>
      )}
    </div>
  );
}
