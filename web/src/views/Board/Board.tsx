import * as React from "react";
import { Card as CardType, Data } from "../../types";
import Card from "@components/Card/Card";
import { boardVars, boardStyles as styles } from "./Board.css";
import { AnimatePresence, motion } from "framer-motion";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useIsMobile } from "@hooks/useIsMobile";

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
          stiffness: 500,
          damping: 32,
          // delay: index * 0.01,
        }}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <Card
          selected={isSelected}
          onClick={() => onClick(index)}
          card={card}
        />
      </motion.div>
    </AnimatePresence>
  );
};

interface BoardProps {
  gameData: Data;
  selectedCardIndexes: number[];
  addCardToSelection: (index: number) => void;
  removeCardFromSelection: (index: number) => void;
}

export const Board: React.FC<React.PropsWithChildren<BoardProps>> = ({
  gameData,
  selectedCardIndexes,
  addCardToSelection,
  removeCardFromSelection,
}) => {
  const [numberOfColumns, setNumberOfColumns] = React.useState(4);
  const isMobile = useIsMobile();

  const handleClick = (index: number): void => {
    console.log("Selected card index: ", selectedCardIndexes);
    if (!selectedCardIndexes.includes(index)) {
      addCardToSelection(index);
    } else {
      removeCardFromSelection(index);
    }
  };

  React.useEffect(() => {
    if (isMobile) {
      setNumberOfColumns(4);
    } else {
      if (gameData.in_play && gameData.in_play.length > 12) {
        const additionalColumns = Math.floor(gameData.in_play.length / 12);
        setNumberOfColumns(4 + additionalColumns);
      } else {
        setNumberOfColumns(4);
      }
    }
  }, [gameData.in_play, isMobile]);

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
          {gameData.in_play &&
            !gameData.game_over &&
            gameData.in_play.map((card, index) => (
              <motion.div
                layout
                key={index}
                className={styles.cardWrap}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 32,
                  delay: index * 0.01,
                }}
              >
                <AnimatedCard
                  card={card}
                  index={index}
                  onClick={handleClick}
                  isSelected={selectedCardIndexes.includes(index)}
                />
              </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
