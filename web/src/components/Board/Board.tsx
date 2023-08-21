import * as React from "react";
import { Card as CardType } from "../../types";
import Card from "@components/Card/Card";
import { boardVars, boardStyles as styles } from "./Board.css"; // Adjust the path as needed
import { AnimatePresence, motion } from "framer-motion";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useDispatch, useSelector } from "react-redux";
import {
  AppDispatch,
  RootState,
  displayNotificationWithTimer,
  moveCards,
  setSelected,
} from "../../store";

export default function Board(): React.ReactElement {
  const in_play = useSelector((state: RootState) => state.game.data.in_play);
  const dispatch = useDispatch<AppDispatch>();
  const selected = useSelector((state: RootState) => state.game.selected);
  const lastSet = useSelector((state: RootState) => state.game.data.last_set);
  const lastPlayer = useSelector(
    (state: RootState) => state.game.data.last_player,
  );

  React.useEffect(() => {
    if (lastSet) {
      dispatch(
        displayNotificationWithTimer(`Player ${lastPlayer} found a set!`),
      );
    }
  }, [lastSet]);

  const [numberOfColumns, setNumberOfColumns] = React.useState(3);

  const handleClick = (card: CardType): void => {
    const i = selected.indexOf(card);
    if (i === -1) {
      new Audio("/sfx/navigation_forward-selection-minimal.wav").play();
      const slctd = [...selected, card];
      if (slctd.length === 3) {
        dispatch(setSelected(slctd));
        dispatch(moveCards(slctd));
        dispatch(setSelected([]));
      } else {
        dispatch(setSelected(slctd));
      }
    } else {
      new Audio("/sfx/navigation_backward-selection-minimal.wav").play();
      dispatch(setSelected(selected.filter((c) => c !== card)));
    }
  };

  React.useEffect(() => {
    if (in_play.length > 12) {
      const additionalColumns = Math.floor(in_play.length / 12);
      setNumberOfColumns(3 + additionalColumns);
    } else {
      setNumberOfColumns(3);
    }
  }, [in_play]);

  return (
    <>
      <div
        className={styles.board}
        style={assignInlineVars({
          [boardVars.columns]: numberOfColumns.toString(),
        })}
      >
        <AnimatePresence>
          {in_play.map((card: CardType, i: number) => (
            <motion.div
              key={`${card.color}-${card.number}-${card.shading}-${card.shape}-${i}`}
              layout
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                delay: i * 0.01,
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
      </div>
    </>
  );
}
