import { useDispatch } from "react-redux";
import { AppDispatch, MessageType, createNewRoom } from "./store";
import { useNavigate } from "react-router-dom";
import { NewGameDialog } from "./dialogs/Newgame";
import React from "react";

export default function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [newGameDialogOpen, setNewGameDialogOpen] = React.useState(false);

  const joinGameHandler = async (playerUsername: string) => {
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
        navigate("/game/" + actionResult.payload);
      }
    } catch (error) {
      console.error("Error creating a new room:", error);
    }
  };

  return (
    <>
      <h1>hello</h1>
      <NewGameDialog
        onClose={() => setNewGameDialogOpen(false)}
        onSubmit={joinGameHandler}
        open={newGameDialogOpen}
      />
      <button onClick={() => setNewGameDialogOpen(true)}>Join Game</button>
    </>
  );
}
