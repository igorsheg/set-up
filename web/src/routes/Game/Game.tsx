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
import Box from "@components/Box/Box";
import { Player } from "@types";
import { AnimatePresence, motion } from "framer-motion";

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

  const gameOverAnimationProps = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -60 },
  };

  const GameEnded = () => {
    const highScore = Math.max(...gameData.players.map((p: Player) => p.score));
    const winners = gameData.players
      .filter((p: Player) => p.score === highScore)
      .map((p: Player) => p.name);
    return (
      <>
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
        <motion.div
          initial="initial"
          animate="animate"
          className={styles.gameOverStyles.container}
          exit="exit"
          variants={gameOverAnimationProps}
          transition={{
            type: "tween",
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <Box xAlign="center">
            <h1>Game Over</h1>
            <p>Winners: {winners.join("& ")}</p>
          </Box>
        </motion.div>
      </>
    );
  };

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
      <div className={styles.gamePageStyles}>
        <AnimatePresence>
          {gameData && gameData.in_play?.length && !gameData.game_over ? (
            <motion.div
              animate="animate"
              exit="exit"
              initial={false}
              style={{
                overflowX: "hidden",
                overflowY: "auto",
                zIndex: 2,
                width: "100%",
              }}
              variants={gameOverAnimationProps}
              transition={{
                type: "tween",
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Board />
            </motion.div>
          ) : (
            <GameEnded />
          )}
        </AnimatePresence>
        <Pill
          handleRequest={() => dispatch(requestCards())}
          game={gameData}
          onMenuItemSelect={handleGameMenuitemSelect}
        />
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
