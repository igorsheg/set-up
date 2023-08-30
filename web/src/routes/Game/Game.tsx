import Board from "@views/Board/Board";
import * as styles from "./Game.css";
import Pill from "@components/Pill/Pill";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ReJoinGameDialog } from "@dialogs/ReJoinGameDialog";
import { InvitePlayersDialog } from "@dialogs/InvitePlayersDialog";
import { GameMenuAction } from "@menus/GameMenu";
import { joinRoom, leaveRoom } from "@services/roomService";
import { AppDispatch, RootState } from "@store/index";
import { requestCards } from "@services/gameService";
import { setActiveRoom } from "@store/roomManager";
import { MessageType } from "@store/websocket";
import { AnimatePresence } from "framer-motion";
import { GameEnded } from "@views/GameEnded/GameEnded";

export default function Game() {
  const gameData = useSelector(
    (state: RootState) => state.gameManager.gameData,
  );
  const activeRoom = useSelector(
    (state: RootState) => state.roomManager.activeRoom,
  );
  const websockerStatus = useSelector(
    (state: RootState) => state.roomManager.webSocketStatus,
  );

  const firstRender = useRef(true);

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

  const joinGameHandler = (room_code: string, playerUsername: string) => {
    new Audio("/sfx/navigation_forward-selection.wav").play();
    dispatch(setActiveRoom({ code: room_code, username: playerUsername }));
    setRoomJoinDialogOpen(false);
  };

  useEffect(() => {
    if (
      websockerStatus !== "OPEN" &&
      activeRoom?.code &&
      activeRoom?.username
    ) {
      dispatch({ type: MessageType.INIT });
    } else if (
      websockerStatus === "OPEN" &&
      activeRoom?.code &&
      activeRoom?.username
    ) {
      dispatch(joinRoom(activeRoom.code, activeRoom.username));
    } else if (room_code) {
      setRoomJoinDialogOpen(true);
    }
  }, [websockerStatus, activeRoom, room_code]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    return () => {
      dispatch(leaveRoom());
    };
  }, []);

  const routeState = () => {
    return gameData.game_over ? (
      <GameEnded />
    ) : !gameData.in_play?.length ? (
      <span>Loading...</span>
    ) : (
      <>
        <Board />
        <Pill
          handleRequest={() => dispatch(requestCards())}
          game={gameData}
          onMenuItemSelect={handleGameMenuitemSelect}
        />
      </>
    );
  };

  return (
    <>
      <div className={styles.gamePageStyles}>
        <AnimatePresence>{routeState()}</AnimatePresence>
      </div>
      <ReJoinGameDialog
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
