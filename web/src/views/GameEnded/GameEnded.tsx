import ReactCanvasConfetti from "@components/Confetti";
import { GameMode, Player } from "@types";
import { motion } from "framer-motion";
import * as styles from "./GameEnded.css";
import Box from "@components/Box/Box";
import { vars } from "@styles/index.css";
import { StarScene } from "@components/Star/Star";
import { useGLTF } from "@react-three/drei";
import Button from "@components/Button/Button";
import { useNavigate } from "react-router-dom";
import { useGameManager } from "@services/gameService";

useGLTF.preload("/star.gltf");

const viewAnimationProps = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -60 },
};

const viewAnimationTransition = {
  type: "tween",
  duration: 0.6,
  ease: [0.16, 1, 0.3, 1],
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

export const GameEnded = () => {
  const navigate = useNavigate();

  const { gameData, resetGameData } = useGameManager();

  const highestScore = Math.max(
    ...gameData.players.map((p: Player) => p.score),
  );

  const firstPlace = gameData.players.find(
    (p: Player) => p.score === highestScore,
  );

  const top3 = gameData.players
    .slice()
    .sort((a: Player, b: Player) => b.score - a.score)
    .slice(0, 3);

  const BestOf3ModeMessage = () => {
    const winner = firstPlace;

    return (
      <Box gap={vars.sizes.s6} xAlign="center">
        <Box gap={0} xAlign="center">
          <StarScene />
          <h1>We have a winner!</h1>
        </Box>
        <Box gap={vars.sizes.s1} xAlign="center" yAlign="center">
          <img
            src={`https://source.boringavatars.com/beam/36/${winner?.client_id}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`}
            alt="avatar"
          />
          <p>{winner?.name}</p>
        </Box>
      </Box>
    );
  };

  const ClassicModeMessage = () => {
    return (
      <Box gap={vars.sizes.s6} xAlign="center">
        <Box gap={vars.sizes.s2} xAlign="center">
          <StarScene />
          <h1>All Set!</h1>
        </Box>

        <Box xAlign="center" gap={vars.sizes.s6}>
          <p style={{ ...vars.typography.m, color: vars.colors.textSecondary }}>
            Top players
          </p>
          <Box xAlign="center" gap={vars.sizes.s6} orientation="row">
            {top3.map((p: Player) => (
              <Box
                key={p?.client_id}
                gap={vars.sizes.s1}
                xAlign="center"
                yAlign="center"
              >
                <img
                  src={`https://source.boringavatars.com/beam/36/${p?.client_id}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`}
                  alt="avatar"
                />
                <Box yAlign="center" xAlign="center" gap={0}>
                  <p>{p?.name}</p>
                  <span
                    style={{
                      ...vars.typography.s,
                      color: vars.colors.textSecondary,
                    }}
                  >
                    Score: {p?.score}
                  </span>
                </Box>
              </Box>
            ))}
          </Box>

          <p>{}</p>
        </Box>
      </Box>
    );
  };

  const message = {
    [GameMode.Bestof3]: <BestOf3ModeMessage />,
    [GameMode.Classic]: <ClassicModeMessage />,
  };

  return (
    <>
      <ReactCanvasConfetti
        {...confettiProps}
        className={styles.confetti}
        fire={true}
      />
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        className={styles.container}
        variants={viewAnimationProps}
        transition={viewAnimationTransition}
      >
        {message[gameData.mode]}
        <Box style={{ paddingTop: vars.sizes.s6 }} orientation="row">
          <Button onClick={() => navigate("/")} variant="ghost">
            Back to Main Menu
          </Button>
          <Button onClick={() => resetGameData()}>Play Again</Button>
        </Box>
      </motion.div>
    </>
  );
};
