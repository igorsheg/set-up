import ReactCanvasConfetti from "@components/Confetti";
import { GameMode, Player } from "@types";
import { motion } from "framer-motion";
import * as styles from "./GameEnded.css";
import Box from "@components/Box/Box";
import { useSelector } from "react-redux";
import { RootState } from "@store/index";
import { vars } from "@styles/index.css";
import { StarScene } from "@components/Star/Star";
import { useGLTF } from "@react-three/drei";

useGLTF.preload(
  "/https://pub-6f25fefc9b794037bc4c392ddd560812.r2.dev/star.gltf",
);

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
  const gameData = useSelector(
    (state: RootState) => state.gameManager.gameData,
  );

  const highScore = Math.max(...gameData.players.map((p: Player) => p.score));
  const winners = gameData.players
    .filter((p: Player) => p.score === highScore)
    .map((p: Player) => p.name);

  const BestOf3ModeMessage = () => {
    const winner = gameData.players.find(
      (p: Player) => p.score === highScore,
    ) as Player;

    return (
      <Box gap={vars.sizes.s6} xAlign="center">
        <Box gap={0} xAlign="center">
          <StarScene />
          <h1>We have a winner!</h1>
        </Box>
        <Box xAlign="center" yAlign="center">
          <img
            src={`https://source.boringavatars.com/beam/36/${winner.name}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`}
            alt="avatar"
          />
          <p style={{ ...vars.typography.l }}>{winner.name}</p>
        </Box>
      </Box>
    );
  };

  const ClassicModeMessage = () => {
    return (
      <Box xAlign="center">
        <h1>Game Over</h1>

        <p>{winners}</p>
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
      </motion.div>
    </>
  );
};
