import Box from "@components/Box/Box";
import Button from "@components/Button/Button";
import { createNewRoom, getPastRooms } from "@services/roomService";
import { AppDispatch, RootState, setActiveRoom } from "@store/index";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { NewGameDialog } from "../../dialogs/NewGameDialog";
import { lobbyStyles } from "./Lobby.css";
import { vars } from "@styles/index.css";
import { JoinGameDialog } from "@dialogs/JoinGameDialog";
import { GameMode } from "@types";
import { AnimatePresence, motion } from "framer-motion";
import { Splash } from "@components/Splash/Splash";
import { ThumbButton } from "@components/ThumbButton/ThumbButton";

export default function Lobby() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const hasSeenSplash = sessionStorage.getItem("hasSeenSplash") === "true";
  const [showSplash, setShowSplash] = useState(!hasSeenSplash);

  const [reqGame, setReqGame] = React.useState<{
    req: undefined | "new" | "join";
    roomCode: string | null;
    mode: GameMode;
  }>({
    req: undefined,
    roomCode: null,
    mode: GameMode.Classic,
  });

  const lobbyActions = [
    {
      type: "action",
      title: "Classic game",
      description: "The original Set game you love, now more fun with friends!",
      image:
        "https://pub-6f25fefc9b794037bc4c392ddd560812.r2.dev/classic_thumb.png",
      onClick: () =>
        setReqGame((draft) => ({
          ...draft,
          req: "new",
          mode: GameMode.Classic,
        })),
    },
    {
      type: "action",
      title: "Best of 3",
      description: "Can't agree on lunch? First to get to 3 sets decides!",
      image:
        "https://pub-6f25fefc9b794037bc4c392ddd560812.r2.dev/bestofthree_thumb.png",
      onClick: () =>
        setReqGame((draft) => ({
          ...draft,
          req: "new",
          mode: GameMode.Bestof3,
        })),
    },
    {
      type: "action",
      title: "Join a game",
      description: "Join an ongoing game and make your mark!",
      image:
        "https://pub-6f25fefc9b794037bc4c392ddd560812.r2.dev/join_room.jpg",
      onClick: () => setReqGame((draft) => ({ ...draft, req: "join" })),
    },
  ];

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

    if (sessionStorage.getItem("hasSeenSplash") !== "true") {
      setShowSplash(true);

      setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem("hasSeenSplash", "true");
      }, 1000);
    }
  }, []);

  const cardMotionVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
    transition: { type: "spring", damping: 30, stiffness: 500 },
  };

  return (
    <Box xAlign="center" gap={vars.sizes.s4} className={lobbyStyles.container}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: vars.sizes.s12,
          height: vars.sizes.s12,
          transform: "translate(-50%, -50%)",
        }}
      >
        <Splash show={showSplash} />
      </div>
      {!showSplash && (
        <>
          <Box
            gap={vars.sizes.s4}
            yAlign="center"
            xAlign="cetner"
            orientation="column"
            className={lobbyStyles.header}
          >
            <h1>Set Up!</h1>
            <p
              style={{
                ...vars.typography.base,
                color: vars.colors.d10,
              }}
            >
              Spot it, match it, win it — Set's the name, speed's the game!
            </p>
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

          <Box
            className={lobbyStyles.cardsContainer}
            orientation="row"
            gap={vars.sizes.s3}
          >
            <AnimatePresence>
              {lobbyActions.map((action, i) => (
                <motion.div
                  variants={cardMotionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{
                    ...cardMotionVariants.transition,
                    delay: i * 0.05,
                  }}
                  key={action.title}
                >
                  <ThumbButton
                    image={action.image}
                    title={action.title}
                    content={action.description}
                    onClick={action.onClick}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>
          {pastRooms.map((roomCode) => (
            <Button
              variant="ghost"
              key={roomCode}
              onClick={() => setReqGame({ ...reqGame, req: "join", roomCode })}
            >
              {roomCode}
            </Button>
          ))}
        </>
      )}
    </Box>
  );
}
