import Board from "@components/Board/Board";
import * as styles from "./Game.css";
import Pill from "@components/Pill/Pill";
import { Player } from "src/types";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { RoomJoinGameDialog } from "@dialogs/RoomJoinGameDialog";
import { InvitePlayersDialog } from "@dialogs/InvitePlayersDialog";
import { GameMenuAction } from "@menus/GameMenu";
import { checkRoomExists, joinRoom } from "@services/roomService";
import { AppDispatch, RootState } from "@store/index";
import { requestCards } from "@services/gameService";

export default function Game() {
  const gameData = useSelector(
    (state: RootState) => state.gameManager.gameData,
  );
  const dispatch = useDispatch<AppDispatch>();

  const navigate = useNavigate();
  const { room_code } = useParams<{ room_code: string }>();

  const [roomJoinDialogOpen, setRoomJoinDialogOpen] = useState(false);
  const [invitePlayersDialogOpen, setInvitePlayersDialogOpen] = useState(false);

  const handleGameMenuitemSelect = (action: GameMenuAction) => {
    switch (action) {
      case GameMenuAction.invite:
        setInvitePlayersDialogOpen(true);
        break;
      case GameMenuAction.leave:
        navigate("/");
        break;
      default:
        console.log("Unknown action");
    }
  };

  const handleGameInit = async (room_code: string) => {
    const isRoomExists = await dispatch(checkRoomExists(room_code));

    if (isRoomExists.payload) {
      setRoomJoinDialogOpen(true);
    } else {
      console.log("Room does not exist");
    }
  };

  const joinGameHandler = (room_code: string, playerUsername: string) => {
    new Audio("/sfx/navigation_forward-selection.wav").play();
    dispatch(joinRoom(room_code, playerUsername));
    setRoomJoinDialogOpen(false);
  };

  useEffect(() => {
    if (room_code) {
      if (gameData && gameData.in_play) {
        setRoomJoinDialogOpen(false);
      } else {
        handleGameInit(room_code);
      }
    }
  }, [room_code, gameData]);

  if (gameData && gameData.game_over) {
    const highScore = Math.max(...gameData.players.map((p: Player) => p.score));
    const winners = gameData.players
      .filter((p: Player) => p.score === highScore)
      .map((p: Player) => p.name);

    return (
      <div className="app">
        <div className="game-over">
          <img width="100%" src="" alt="game-over" />
          <div>{`Winner: ${winners.join("& ")}`}</div>
          <button type="button" onClick={() => false}>
            Play again?
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.gamePageStyles}>
        {gameData && gameData.in_play && (
          <>
            <Board />
            <Pill
              handleRequest={() => dispatch(requestCards())}
              game={gameData}
              onMenuItemSelect={handleGameMenuitemSelect}
            />
          </>
        )}
      </div>
      <RoomJoinGameDialog
        room_code={room_code ?? ""}
        onSubmit={joinGameHandler}
        open={roomJoinDialogOpen}
        dismissible={false}
      />
      <InvitePlayersDialog
        roomCode={room_code ?? ""}
        onSubmit={() => setInvitePlayersDialogOpen(false)}
        onClose={() => setInvitePlayersDialogOpen(false)}
        open={invitePlayersDialogOpen}
      />
    </>
  );
}
