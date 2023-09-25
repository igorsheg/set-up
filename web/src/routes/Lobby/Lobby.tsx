import Box from "@components/Box/Box";
import Button from "@components/Button/Button";
import { createNewRoom, getPastRooms } from "@services/roomService";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NewGameDialog } from "../../dialogs/NewGameDialog";
import { lobbyStyles } from "./Lobby.css";
import { vars } from "@styles/index.css";
import { JoinGameDialog } from "@dialogs/JoinGameDialog";
import { GameMode } from "@types";
import { AnimatePresence, motion } from "framer-motion";
import { ThumbButton } from "@components/ThumbButton/ThumbButton";
import { ACTIONS, LobbyActions } from "./lobby-actions";
import { useStore } from "effector-react";
import { $roomManager, setActiveRoom } from "@store/roomManager";

const cardMotionVariants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -50 },
};

export default function Lobby() {
  const navigate = useNavigate();

  const [reqGame, setReqGame] = React.useState<
    Pick<LobbyActions, "type" | "mode"> & { roomCode?: string }
  >();

  const { pastRooms } = useStore($roomManager);

  const createGameHandler = async (playerUsername: string, mode: GameMode) => {
    try {
      const roomCode = await createNewRoom(mode);

      setActiveRoom({
        code: roomCode,
        username: playerUsername,
      });

      setReqGame({ type: "new", roomCode, mode });
      navigate("/game/" + roomCode);
    } catch (error) {
      console.error("Error creating a new room:", error);
    }
  };

  const joinGameHandler = (roomCode: string, playerUsername: string) => {
    setActiveRoom({
      code: roomCode,
      username: playerUsername,
    });
    setReqGame({ ...reqGame, type: "join", roomCode });
    navigate("/game/" + roomCode);
  };

  const getPlayerPastRooms = async () => {
    await getPastRooms();
  };

  useEffect(() => {
    getPlayerPastRooms();
  }, []);

  const handleActionClick = ({ type, mode }: LobbyActions) => {
    setReqGame({ ...reqGame, type, mode: mode });
  };

  return (
    <Box xAlign="center" gap={vars.sizes.s4} className={lobbyStyles.container}>
      <>
        <Box
          gap={vars.sizes.s4}
          yAlign="center"
          xAlign="cetner"
          orientation="column"
          className={lobbyStyles.header}
        >
          <h1>Set Up!</h1>
          <p>Spot it, match it, win it — Set's the name, speed's the game!</p>
        </Box>
        <NewGameDialog
          onClose={() => setReqGame(undefined)}
          onSubmit={createGameHandler}
          open={reqGame?.type === "new"}
          mode={reqGame?.mode}
        />
        <JoinGameDialog
          onClose={() => setReqGame(undefined)}
          onSubmit={joinGameHandler}
          open={reqGame?.type === "join"}
        />

        <Box
          className={lobbyStyles.cardsContainer}
          orientation="row"
          gap={vars.sizes.s3}
        >
          <AnimatePresence>
            {ACTIONS.map((action, i) => (
              <motion.div
                variants={cardMotionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{
                  type: "spring",
                  damping: 30,
                  stiffness: 500,
                  delay: i * 0.05,
                }}
                key={action.title}
              >
                <ThumbButton
                  image={action.image}
                  title={action.title}
                  content={action.description}
                  onClick={() => handleActionClick(action)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>
        {!!pastRooms.length && (
          <Box className={lobbyStyles.pastRoomsContainer} orientation="column">
            <p
              style={{ ...vars.typography.m, color: vars.colors.textSecondary }}
            >
              Get back into previous games:
            </p>
            {pastRooms.map((roomCode) => (
              <Button
                variant="ghost"
                key={roomCode}
                onClick={() =>
                  setReqGame({ ...reqGame, type: "join", roomCode })
                }
              >
                {roomCode}
              </Button>
            ))}
          </Box>
        )}
      </>
    </Box>
  );
}
