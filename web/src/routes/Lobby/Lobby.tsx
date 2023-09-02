import Box from "@components/Box/Box";
import Button from "@components/Button/Button";
import { createNewRoom, getPastRooms } from "@services/roomService";
import { AppDispatch, RootState, setActiveRoom } from "@store/index";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { NewGameDialog } from "../../dialogs/NewGameDialog";
import { lobbyStyles, lobbyButtonStyles } from "./Lobby.css";
import { ChevronRight } from "lucide-react";
import { vars } from "@styles/index.css";
import { JoinGameDialog } from "@dialogs/JoinGameDialog";
import { GameMode } from "@types";
import { motion } from "framer-motion";

export default function Lobby() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [reqGame, setReqGame] = React.useState<{
    req: undefined | "new" | "join";
    roomCode: string | null;
    mode: GameMode;
  }>({
    req: undefined,
    roomCode: null,
    mode: GameMode.Classic,
  });

  const pastRooms = useSelector(
    (state: RootState) => state.roomManager.pastRooms,
  );

  const createGameHandler = async (playerUsername: string, mode: GameMode) => {
    try {
      const actionResult = await dispatch(createNewRoom(mode));

      if (createNewRoom.fulfilled.match(actionResult)) {
        dispatch(
          setActiveRoom({
            code: actionResult.payload,
            username: playerUsername,
          }),
        );
        // new Audio("/sfx/navigation_forward-selection.wav").play();
        setReqGame({ req: "new", roomCode: actionResult.payload, mode });
        navigate("/game/" + actionResult.payload);
      }
    } catch (error) {
      console.error("Error creating a new room:", error);
    }
  };

  const joinGameHandler = (roomCode: string, playerUsername: string) => {
    dispatch(
      setActiveRoom({
        code: roomCode,
        username: playerUsername,
      }),
    );
    setReqGame({ ...reqGame, req: "join", roomCode });
    navigate("/game/" + roomCode);
  };

  const getPlayerPastRooms = async () => {
    await dispatch(getPastRooms());
  };

  useEffect(() => {
    getPlayerPastRooms();
  }, []);

  return (
    <Box xAlign="center" className={lobbyStyles.container}>
      <Box gap={vars.sizes.s4} yAlign="center" orientation="row">
        <h1>Set Up!</h1>
      </Box>
      <NewGameDialog
        onClose={() =>
          setReqGame({ ...reqGame, req: undefined, roomCode: null })
        }
        onSubmit={createGameHandler}
        open={reqGame.req === "new"}
        mode={reqGame.mode}
      />
      <JoinGameDialog
        onClose={() =>
          setReqGame({ ...reqGame, req: undefined, roomCode: null })
        }
        onSubmit={joinGameHandler}
        open={reqGame.req === "join"}
      />
      <motion.button
        className={lobbyButtonStyles.container}
        onClick={() =>
          setReqGame((draft) => ({
            ...draft,
            req: "new",
            mode: GameMode.Classic,
          }))
        }
      >
        <Box gap={vars.sizes.s1}>
          <p>Start a classic game</p>
          <span>Play with friends in the classic mode</span>
        </Box>

        <ChevronRight />
      </motion.button>
      <motion.button
        className={lobbyButtonStyles.container}
        onClick={() =>
          setReqGame((draft) => ({
            ...draft,
            req: "new",
            mode: GameMode.Bestof3,
          }))
        }
      >
        <Box gap={vars.sizes.s1}>
          <p>Start a quick standoff</p>
          <span>Compete at a best of 3 round</span>
        </Box>

        <ChevronRight />
      </motion.button>
      <button
        className={lobbyButtonStyles.container}
        onClick={() => setReqGame((draft) => ({ ...draft, req: "join" }))}
      >
        <Box gap={vars.sizes.s1}>
          <p>Join a game</p>
          <span>Join an existing room</span>
        </Box>
        <ChevronRight />
      </button>
      {pastRooms.map((roomCode) => (
        <Button
          variant="outline"
          key={roomCode}
          onClick={() => setReqGame({ ...reqGame, req: "join", roomCode })}
        >
          {roomCode}
        </Button>
      ))}
    </Box>
  );
}
