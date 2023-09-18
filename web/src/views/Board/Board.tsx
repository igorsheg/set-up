import * as React from "react";
import { Card as CardType } from "../../types";
import Card from "@components/Card/Card";
import { boardVars, boardStyles as styles } from "./Board.css";
import { AnimatePresence, motion } from "framer-motion";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useDispatch, useSelector } from "react-redux";
import {
  AppDispatch,
  RootState,
  addSelectedCard,
  removeSelectedCard,
} from "../../store";
import { useIsMobile } from "@hooks/useIsMobile";
import { moveCards } from "@services/gameService";

export default function Board(): React.ReactElement {
  const in_play = useSelector(
    (state: RootState) => state.gameManager.gameData.in_play,
  );

  const selectedIndexes = useSelector(
    (state: RootState) => state.gameManager.selectedCardIndexes,
  );

  const game_over = useSelector(
    (state: RootState) => state.gameManager.gameData.game_over,
  );
  const dispatch = useDispatch<AppDispatch>();

  const [numberOfColumns, setNumberOfColumns] = React.useState(3);
  const isMobile = useIsMobile();

  const [prevInPlay, setPrevInPlay] = React.useState<CardType[]>([]);

  React.useEffect(() => {
    if (in_play) {
      setPrevInPlay(in_play);
    }
  }, [in_play]);

  const handleClick = (index: number): void => {
    if (!selectedIndexes.includes(index)) {
      const newSelectedIndexes = [...selectedIndexes, index];
      if (newSelectedIndexes.length === 3 && in_play) {
        const selectedCards = newSelectedIndexes.map((i) => in_play[i]);
        dispatch(moveCards(selectedCards));
      } else {
        dispatch(addSelectedCard(index));
      }
    } else {
      dispatch(removeSelectedCard(index));
    }
  };

  React.useEffect(() => {
    if (isMobile) {
      setNumberOfColumns(4);
    } else {
      if (in_play && in_play.length > 12) {
        const additionalColumns = Math.floor(in_play.length / 12);
        setNumberOfColumns(4 + additionalColumns);
      } else {
        setNumberOfColumns(4);
      }
    }
  }, [in_play, isMobile]);

  const viewAnimationProps = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };
  const createCardKey = (card: CardType): string => {
    return `${card.color}-${card.shape}-${card.number}-${card.shading}`;
  };

  const getAnimationProps = (
    card: CardType,
    index: number,
    prevInPlay: CardType[],
    selectedIndexes: number[],
  ) => {
    const wasInPrevPlay = prevInPlay.some(
      (prevCard) => createCardKey(prevCard) === createCardKey(card),
    );

    const initialProps = {
      opacity: wasInPrevPlay ? 1 : 0,
      y: wasInPrevPlay ? 0 : 50,
    };

    const animateProps = {
      opacity: 1,
      y: 0,
    };

    const exitProps = selectedIndexes.includes(index)
      ? { opacity: 0, y: -50 }
      : {};

    return { initial: initialProps, animate: animateProps, exit: exitProps };
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
        <AnimatePresence custom="wait">
          {in_play &&
            !game_over &&
            in_play.map((card: CardType, i: number) => {
              const animationProps = getAnimationProps(
                card,
                i,
                prevInPlay,
                selectedIndexes,
              );

              return (
                <motion.div
                  key={createCardKey(card)}
                  initial={animationProps.initial}
                  animate={animationProps.animate}
                  exit={animationProps.exit}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 27,
                    delay: i * 0.01,
                  }}
                >
                  <Card
                    selected={selectedIndexes.includes(i)}
                    onClick={() => handleClick(i)}
                    card={card}
                    hidden={card.color === null}
                  />
                </motion.div>
              );
            })}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
