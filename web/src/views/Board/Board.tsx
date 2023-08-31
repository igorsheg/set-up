import * as React from "react";
import { Card as CardType } from "../../types";
import Card from "@components/Card/Card";
import { boardVars, boardStyles as styles } from "./Board.css";
import { AnimatePresence, motion } from "framer-motion";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState, setSelectedCards } from "../../store";
import { useIsMobile } from "@hooks/useIsMobile";
import { moveCards } from "@services/gameService";

const selectSound = new Audio("/sfx/navigation_forward-selection-minimal.wav");
const unSelectSound = new Audio(
  "/sfx/navigation_backward-selection-minimal.wav",
);
selectSound.preload = "auto";
unSelectSound.preload = "auto";

const playSound = (sound: HTMLAudioElement) => {
  sound.currentTime = 0;
  sound.play();
};

export default function Board(): React.ReactElement {
  const in_play = useSelector(
    (state: RootState) => state.gameManager.gameData.in_play,
  );

  const game_over = useSelector(
    (state: RootState) => state.gameManager.gameData.game_over,
  );
  const dispatch = useDispatch<AppDispatch>();
  const selected = useSelector(
    (state: RootState) => state.gameManager.selectedCards,
  );

  const [numberOfColumns, setNumberOfColumns] = React.useState(3);
  const isMobile = useIsMobile();

  const handleClick = (card: CardType): void => {
    const i = selected.indexOf(card);
    if (i === -1) {
      playSound(selectSound);
      const slctd = [...selected, card];
      if (slctd.length === 3) {
        dispatch(setSelectedCards(slctd));
        dispatch(moveCards(slctd));
        dispatch(setSelectedCards([]));
      } else {
        dispatch(setSelectedCards(slctd));
      }
    } else {
      playSound(unSelectSound);
      dispatch(setSelectedCards(selected.filter((c) => c !== card)));
    }
  };

  React.useEffect(() => {
    if (isMobile) {
      setNumberOfColumns(4);
    } else {
      if (in_play && in_play.length > 12) {
        const additionalColumns = Math.floor(in_play.length / 12);
        setNumberOfColumns(3 + additionalColumns);
      } else {
        setNumberOfColumns(3);
      }
    }
  }, [in_play, isMobile]);

  const cardMotionVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { type: "spring", damping: 30, stiffness: 500 },
  };

  const viewAnimationProps = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -60 },
  };

  return (
    <>
      <motion.div
        animate="animate"
        exit="exit"
        initial={false}
        variants={viewAnimationProps}
        className={styles.board}
        style={assignInlineVars({
          [boardVars.columns]: numberOfColumns.toString(),
        })}
      >
        <AnimatePresence>
          {in_play &&
            !game_over &&
            in_play.map((card: CardType, i: number) => (
              <motion.div
                key={`${card.color}-${card.number}-${card.shading}-${card.shape}-${i}`}
                layout
                variants={cardMotionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{
                  ...cardMotionVariants.transition,
                  delay: i * 0.005,
                }}
              >
                <Card
                  selected={selected.indexOf(card) !== -1}
                  onClick={(): void => handleClick(card)}
                  card={card}
                  hidden={card.color === null}
                />
              </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
