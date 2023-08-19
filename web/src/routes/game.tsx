import Board from "@components/Board/Board";
import * as styles from "./game.css";
import Pill from "@components/Pill/Pill";
import { Card, Player } from "src/types";
import { useEffect } from "react";
import { GameState, MessageType } from "../store";
import { useDispatch, useSelector } from "react-redux";

export default function Game() {
  // const {
  //   data,
  //   selected,
  //   setSelected,
  //   handleMove,
  //   handleRequest,
  //   handleNew,
  //   handleJoin,
  //   status,
  // } = useGameWebSocket();

  // if (!room_code) {
  //   return null;
  // }

  // const { data } = useGetGameStateQuery();
  const data = useSelector((state: { game: GameState }) => state.game.data);
  const selected = useSelector(
    (state: { game: GameState }) => state.game.selected,
  );

  // dispatch({
  //   type: MessageType.MOVE,
  //     payload: { cards: selectedCards }
  //     });
  //
  const dispatch = useDispatch();

  // const handleJoin = () => {
  //   dispatch(joinGameThunk({ room_code, playerUsername: "player1" }));
  // };
  //
  const handleNew = () => false;
  const handleMove = () => {
    dispatch({
      type: MessageType.MOVE,
    });
  };
  const handleRequest = () => {
    dispatch({
      type: MessageType.REQUEST,
    });
  };
  const setSelected = () => false;

  // useEffect(() => {
  //   if (room_code) {
  //     dispatch({
  //       type: MessageType.JOIN,
  //       payload: { room_code, playerUsername: "asd" },
  //     });
  //   }
  // }, [room_code]);

  useEffect(() => {
    console.log("data", data);
  }, [data]);

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
          <button type="button" onClick={() => handleNew()}>
            Play again?
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gamePageStyles}>
      {data && data.in_play ? (
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
