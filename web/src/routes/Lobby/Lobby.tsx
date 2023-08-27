import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { NewGameDialog } from "../../dialogs/NewGameDialog";
import React, { useEffect } from "react";
import Button from "@components/Button/Button";
import Box from "@components/Box/Box";
import { AppDispatch, RootState } from "@store/index";
import { createNewRoom, getPastRooms, joinRoom } from "@services/roomService";
import { RoomJoinGameDialog } from "@dialogs/RoomJoinGameDialog";
import { lobbyStyles } from "./Lobby.css";

export default function Lobby() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const activeRoom = useSelector(
    (state: RootState) => state.roomManager.activeRoom,
  );
  const gameData = useSelector(
    (state: RootState) => state.gameManager.gameData,
  );

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
        dispatch(joinRoom(actionResult.payload, playerUsername));
        new Audio("/sfx/navigation_forward-selection.wav").play();
        navigate("/game/" + actionResult.payload);
      }
    } catch (error) {
      console.error("Error creating a new room:", error);
    }
  };

  const joinGameHandler = (roomCode: string, playerUsername: string) => {
    dispatch(joinRoom(roomCode, playerUsername));
    // navigate("/game/" + roomCode);
  };

  const getPlayerPastRooms = async () => {
    await dispatch(getPastRooms());
  };

  useEffect(() => {
    getPlayerPastRooms();
  }, []);

  useEffect(() => {
    if (reqGame.req === "join" && activeRoom && gameData.in_play?.length) {
      new Audio("/sfx/navigation_forward-selection.wav").play();
      navigate("/game/" + activeRoom);
      // joinGameHandler(reqGame.roomCode!, "Player");
    }
    // getPlayerPastRooms();
  }, [reqGame, activeRoom, gameData]);

  return (
    <Box xAlign="center" className={lobbyStyles.container}>
      <h1>Set Up!</h1>
      <NewGameDialog
        onClose={() => setReqGame({ req: undefined, roomCode: null })}
        onSubmit={createGameHandler}
        open={reqGame.req === "new"}
      />
      <RoomJoinGameDialog
        room_code={reqGame.roomCode || ""}
        onSubmit={joinGameHandler}
        open={reqGame.req === "join"}
      />
      <Button
        dimentions="large"
        onClick={() => setReqGame((draft) => ({ ...draft, req: "new" }))}
      >
        Start a New Game
      </Button>
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
