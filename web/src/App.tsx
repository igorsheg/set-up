import { useDispatch } from "react-redux";
import { AppDispatch, MessageType, createNewRoom } from "./store";
import { useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const joinGameHandler = async () => {
    try {
      const actionResult = await dispatch(createNewRoom());

      if (createNewRoom.fulfilled.match(actionResult)) {
        dispatch({
          type: MessageType.JOIN,
          payload: {
            player_username: "yagosh2",
            room_code: actionResult.payload,
          },
        });
        navigate("/game/" + actionResult.payload);
      }
    } catch (error) {
      console.error("Error creating a new room:", error);
    }
  };

  return (
    <>
      <h1>hello</h1>
      <button onClick={joinGameHandler}>Join Game</button>
    </>
  );
}
