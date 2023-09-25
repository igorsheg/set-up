import * as React from "react";
import { Card as CardType, GameAction, MessageType } from "../../types";
import Card from "@components/Card/Card";
import { boardVars, boardStyles as styles } from "./Board.css";
import { AnimatePresence, motion } from "framer-motion";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useIsMobile } from "@hooks/useIsMobile";
import { moveCards } from "@services/gameService";
import {
  $gameManager,
  addSelectedCard,
  clearSelectedCards,
  removeSelectedCard,
} from "@store/gameManager";
import { useStore } from "effector-react";
import { $roomManager } from "@store/roomManager";
import { sendAction } from "@store/websocket";

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
        />
      </motion.div>
    </AnimatePresence>
  );
};

export const Board: React.FC = () => {
  const { gameData, selectedCardIndexes } = useStore($gameManager);
  const { activeRoom } = useStore($roomManager);

  const [numberOfColumns, setNumberOfColumns] = React.useState(4);
  const isMobile = useIsMobile();

  const handleClick = (index: number): void => {
    if (!selectedCardIndexes.includes(index)) {
      const newSelectedIndexes = [...selectedCardIndexes, index];
      if (newSelectedIndexes.length === 3 && gameData.in_play && activeRoom) {
        const selectedCards = newSelectedIndexes.map(
          (i) => gameData.in_play[i],
        );

        const action: GameAction = {
          type: MessageType.MOVE,
          payload: {
            room_code: activeRoom.code,
            cards: selectedCards,
          },
        };
        sendAction(action);
        clearSelectedCards();
      } else {
        addSelectedCard(index);
      }
    } else {
      removeSelectedCard(index);
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
                  stiffness: 300,
                  damping: 27,
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
