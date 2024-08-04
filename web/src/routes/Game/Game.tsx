import { Board } from "@views/Board/Board";
import * as styles from "./Game.css";
import Pill from "@components/Pill/Pill";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ReJoinGameDialog } from "@dialogs/ReJoinGameDialog";
import { InvitePlayersDialog } from "@dialogs/InvitePlayersDialog";
import { AnimatePresence } from "framer-motion";
import { GameEnded } from "@views/GameEnded/GameEnded";
import { Splash } from "@components/Splash/Splash";
import { vars } from "@styles/index.css";
import { useGameManager } from "@services/gameService";
import { useRoomManager } from "@services/roomService";
import { useAppSettings } from "@services/appSettingsService";
import { GameMenuAction } from "@types";
import { useGLTF } from "@react-three/drei";

useGLTF.preload("/star.gltf");

export default function Game() {
  const { toggleSound } = useAppSettings();
  const {
    gameData,
    requestCards,
    addCardToSelection,
    removeCardFromSelection,
    selectedCardIndexes,
    activeNotifications,
    websocketStatus,
  } = useGameManager();
  const { setActiveRoom, activeRoom, joinRoom } = useRoomManager();

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
      case GameMenuAction.mute:
        toggleSound();
        break;
      default:
        console.log("Unknown action");
    }
  };

  const joinGameHandler = (room_code: string, playerUsername: string) => {
    setActiveRoom({ code: room_code, username: playerUsername });
    setRoomJoinDialogOpen(false);
  };

  useEffect(() => {
    if (room_code && !activeRoom) {
      setRoomJoinDialogOpen(true);
    } else if (room_code && activeRoom) {
      joinRoom(activeRoom.code, activeRoom.username);
    }
  }, [room_code, activeRoom, joinRoom]);

  const routeState = () => {
    return gameData.game_over ? (
      <GameEnded />
    ) : !gameData.in_play?.length ? (
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: vars.sizes.s12,
          height: vars.sizes.s12,
          zIndex: 2,
          transform: "translate(-50%, -50%)",
        }}
      >
        <Splash show={!gameData.in_play?.length} />
      </div>
    ) : (
      <>
        <Board
          gameData={gameData}
          addCardToSelection={addCardToSelection}
          removeCardFromSelection={removeCardFromSelection}
          selectedCardIndexes={selectedCardIndexes}
        />
        <Pill
          activeNotifications={activeNotifications}
          websocketStatus={websocketStatus}
          handleRequest={requestCards}
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
