import Board from "@components/Board/Board";
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
import ReactCanvasConfetti from "@components/Confetti";
import confetti from "canvas-confetti";

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

  // if (gameData && gameData.game_over) {
  //   const highScore = Math.max(...gameData.players.map((p: Player) => p.score));
  //   const winners = gameData.players
  //     .filter((p: Player) => p.score === highScore)
  //     .map((p: Player) => p.name);
  //
  //   const confettiProps: confetti.Options = {
  //     spread: 360,
  //     ticks: 50,
  //     gravity: 0,
  //     decay: 0.94,
  //     startVelocity: 30,
  //     shapes: ["star"],
  //     colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
  //     particleCount: 40,
  //     scalar: 1.2,
  //   };
  //
  //   return (
  //     <AnimatePresence>
  //       <motion.div
  //         initial={{ opacity: 0 }}
  //         animate={{ opacity: 1 }}
  //         exit={{ opacity: 0 }}
  //       >
  //         <ReactCanvasConfetti
  //           {...confettiProps}
  //           style={{
  //             position: "fixed",
  //             top: 0,
  //             left: 0,
  //             zIndex: 1000,
  //             width: "100vw",
  //             height: "100vh",
  //             userSelect: "none",
  //             pointerEvents: "none",
  //           }}
  //           fire={true}
  //           className="canvas"
  //         />
  //         <Box>
  //           <div>{`Winner: ${winners.join("& ")}`}</div>
  //           <button type="button" onClick={() => false}>
  //             Play again?
  //           </button>
  //         </Box>
  //       </motion.div>
  //     </AnimatePresence>
  //   );
  // }

  const confettiProps: confetti.Options = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    shapes: ["star"],
    colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
    particleCount: 40,
    scalar: 1.2,
  };

  return (
    <>
      {gameData && gameData.game_over && (
        <ReactCanvasConfetti
          {...confettiProps}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1000,
            width: "100vw",
            height: "100vh",
            userSelect: "none",
            pointerEvents: "none",
          }}
          fire={true}
          className="canvas"
        />
      )}
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
