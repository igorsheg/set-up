import Board from "@components/Board/Board";
import * as styles from "./game.css";
import Pill from "@components/Pill/Pill";
import { Player } from "src/types";
import { AppDispatch, MessageType, RootState, setRoomCode } from "../store";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Game() {
  const data = useSelector((state: RootState) => state.game.data);
  const [pastRooms, setPastRooms] = useState([]);
  const { room_code } = useParams<{ room_code: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const joinGameHandler = async (room_code: string) => {
    dispatch({
      type: MessageType.JOIN,
      payload: { player_username: "yagosh2", room_code },
    });
  };

  const getPlayerPastRooms = async () => {
    const url = "http://" + import.meta.env.VITE_BACKEND_URL + "/past_rooms";
    console.log(url);
    const pasrRoomsReq = await fetch(url, { credentials: "include" });
    const pastRooms = await pasrRoomsReq.json();
    console.log(pastRooms);
    setPastRooms(pastRooms);
  };

  useEffect(() => {
    if (room_code) {
      getPlayerPastRooms();
      dispatch(setRoomCode(room_code));
    }
  }, [room_code]);

  const handleNew = () => false;

  const handleRequest = () => {
    dispatch({
      type: MessageType.REQUEST,
    });
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
          <Board />
          <Pill handleRequest={handleRequest} game={data} />
        </>
      ) : (
        <>
          <div>Waiting for players</div>
          {pastRooms.map((room) => (
            <button key={room} onClick={() => joinGameHandler(room)}>
              {room}
            </button>
          ))}
        </>
      )}
    </div>
  );
}
