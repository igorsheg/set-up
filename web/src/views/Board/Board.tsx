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

const createCardKey = (card: CardType): string => {
  return `${card.color}-${card.shape}-${card.number}-${card.shading}`;
};

interface AnimatedCardProps {
  card: CardType;
  index: number;
  onClick: (index: number) => void;
  isSelected: boolean;
}

const AnimatedCard: React.FC<React.PropsWithChildren<AnimatedCardProps>> = ({
  card,
  index,
  onClick,
  isSelected,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        key={createCardKey(card)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          type: "spring",
          stiffness: 450,
          damping: 26,
          delay: index * 0.01,
        }}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <Card
          selected={isSelected}
          onClick={() => onClick(index)}
          card={card}
          hidden={card.color === null}
        />
      </motion.div>
    </AnimatePresence>
  );
};

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

  const [numberOfColumns, setNumberOfColumns] = React.useState(4);
  const isMobile = useIsMobile();

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

  return (
    <>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={styles.board}
        style={assignInlineVars({
          [boardVars.columns]: numberOfColumns.toString(),
        })}
      >
        <AnimatePresence>
          {in_play &&
            !game_over &&
            in_play.map((card, index) => (
              <motion.div
                layout
                key={index}
                className={styles.cardWrap}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 27,
                }}
              >
                <AnimatedCard
                  card={card}
                  index={index}
                  onClick={handleClick}
                  isSelected={selectedIndexes.includes(index)}
                />
              </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
