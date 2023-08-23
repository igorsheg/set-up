import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, MessageType, RootState, createNewRoom } from "./store";
import { useNavigate } from "react-router-dom";
import { NewGameDialog } from "./dialogs/NewGameDialog";
import React, { useEffect, useState } from "react";
import Button from "@components/Button/Button";
import * as styles from "./App.css";
import Box from "@components/Box/Box";

export default function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [newGameDialogOpen, setNewGameDialogOpen] = React.useState(false);
  const [pastRooms, setPastRooms] = useState([]);
  const gameData = useSelector((state: RootState) => state.game.data);
  const roomCode = useSelector((state: RootState) => state.game.roomCode);

  const [requestedToJoin, setRequestedToJoin] = useState(false);

  const createGameHandler = async (playerUsername: string) => {
    setNewGameDialogOpen(false);
    try {
      const actionResult = await dispatch(createNewRoom());

      if (createNewRoom.fulfilled.match(actionResult)) {
        dispatch({
          type: MessageType.JOIN,
          payload: {
            player_username: playerUsername,
            room_code: actionResult.payload,
          },
        });
        new Audio("/sfx/navigation_forward-selection.wav").play();
        setRequestedToJoin(true);
      }
    } catch (error) {
      console.error("Error creating a new room:", error);
    }
  };

  useEffect(() => {
    if (requestedToJoin && gameData && gameData.in_play) {
      navigate("/game/" + roomCode);
    }
  }, [requestedToJoin, gameData, roomCode]);

  const getPlayerPastRooms = async () => {
    const pasrRoomsReq = await fetch("/api/past_rooms", {
      credentials: "include",
    });
    const pastRooms = await pasrRoomsReq.json();
    console.log(pastRooms);
    setPastRooms(pastRooms);
  };

  useEffect(() => {
    getPlayerPastRooms();
  }, []);

  return (
    <Box className={styles.appStyles}>
      <h1>Set Up!</h1>
      {pastRooms.map((room) => (
        <button key={room} onClick={() => createGameHandler(room)}>
          {room}
        </button>
      ))}

      <NewGameDialog
        onClose={() => setNewGameDialogOpen(false)}
        onSubmit={createGameHandler}
        open={newGameDialogOpen}
      />
      <Button dimentions="large" onClick={() => setNewGameDialogOpen(true)}>
        Start a New Game
      </Button>
    </Box>
  );
}
