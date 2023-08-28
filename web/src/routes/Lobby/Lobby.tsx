import Box from "@components/Box/Box";
import Button from "@components/Button/Button";
import { ReJoinGameDialog } from "@dialogs/ReJoinGameDialog";
import { createNewRoom, getPastRooms, joinRoom } from "@services/roomService";
import { AppDispatch, RootState, setActiveRoom } from "@store/index";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { NewGameDialog } from "../../dialogs/NewGameDialog";
import { lobbyStyles, lobbyButtonStyles } from "./Lobby.css";
import { ChevronRight } from "lucide-react";
import { vars } from "@styles/index.css";

function SetLogo() {
  return (
    <svg
      width={158}
      height={158}
      viewBox="0 0 158 158"
      fill="none"
      style={{ width: "60px", height: "60px" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M76 38c0 20.987-17.013 38-38 38S0 58.987 0 38 17.013 0 38 0s38 17.013 38 38zM0 120c0-20.987 17.013-38 38-38h38v38c0 20.987-17.013 38-38 38S0 140.987 0 120z"
        fill="#F76808"
      />
      <circle cx={120} cy={120} r={38} fill="#F76808" />
      <path
        d="M82 38c0-20.987 17.013-38 38-38s38 17.013 38 38-17.013 38-38 38H82V38z"
        fill="#F76808"
      />
    </svg>
  );
}

export default function Lobby() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [reqGame, setReqGame] = React.useState<{
    req: undefined | "new" | "join";
    roomCode: string | null;
  }>({
    req: undefined,
    roomCode: null,
  });

  const pastRooms = useSelector(
    (state: RootState) => state.roomManager.pastRooms,
  );

  const createGameHandler = async (playerUsername: string) => {
    try {
      const actionResult = await dispatch(createNewRoom());

      if (createNewRoom.fulfilled.match(actionResult)) {
        // dispatch(joinRoom(actionResult.payload, playerUsername));
        dispatch(
          setActiveRoom({
            code: actionResult.payload,
            username: playerUsername,
          }),
        );
        new Audio("/sfx/navigation_forward-selection.wav").play();
        setReqGame({ req: "new", roomCode: actionResult.payload });
        navigate("/game/" + actionResult.payload);
      }
    } catch (error) {
      console.error("Error creating a new room:", error);
    }
  };

  const joinGameHandler = (roomCode: string, playerUsername: string) => {
    dispatch(joinRoom(roomCode, playerUsername));
    setReqGame({ req: "join", roomCode });
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
        <SetLogo />
        <h1>Set Up!</h1>
      </Box>
      <NewGameDialog
        onClose={() => setReqGame({ req: undefined, roomCode: null })}
        onSubmit={createGameHandler}
        open={reqGame.req === "new"}
      />
      <ReJoinGameDialog
        room_code={reqGame.roomCode || ""}
        onSubmit={joinGameHandler}
        open={reqGame.req === "join"}
      />
      <button
        className={lobbyButtonStyles.container}
        onClick={() => setReqGame((draft) => ({ ...draft, req: "new" }))}
      >
        <Box>
          <p>Start a classic game</p>
          <span>Play with friends in the classic mode</span>
        </Box>

        <ChevronRight />
      </button>
      <button
        className={lobbyButtonStyles.container}
        onClick={() => setReqGame((draft) => ({ ...draft, req: "new" }))}
      >
        <Box>
          <p>Join a game</p>
          <span>Join an existing room</span>
        </Box>
        <ChevronRight />
      </button>
      {pastRooms.map((roomCode) => (
        <Button
          variant="outline"
          key={roomCode}
          onClick={() => setReqGame({ req: "join", roomCode })}
        >
          {roomCode}
        </Button>
      ))}
    </Box>
  );
}
