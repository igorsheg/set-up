import * as React from "react";
import { Card as CardType } from "../../types";
import Card from "@components/Card/Card";
import { boardVars, boardStyles as styles } from "./Board.css"; // Adjust the path as needed
import { AnimatePresence, motion } from "framer-motion";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState, moveCards, setSelected } from "../../store";

export default function Board(): React.ReactElement {
  const in_play = useSelector((state: RootState) => state.game.data.in_play);
  const dispatch = useDispatch<AppDispatch>();
  const selected = useSelector((state: RootState) => state.game.selected);

  const [numberOfColumns, setNumberOfColumns] = React.useState(3);
  const [numberOfRows, setNumberOfRows] = React.useState(4);

  const handleClick = (card: CardType): void => {
    const i = selected.indexOf(card);
    if (i === -1) {
      const slctd = [...selected, card];
      if (slctd.length === 3) {
        dispatch(setSelected(slctd));
        dispatch(moveCards(slctd));
        dispatch(setSelected([]));
      } else {
        dispatch(setSelected(slctd));
      }
    } else {
      dispatch(setSelected(selected.filter((c) => c !== card)));
    }
  };

  React.useEffect(() => {
    if (in_play.length > 18) {
      const columns = Math.ceil(in_play.length / 3);
      setNumberOfColumns(columns);
      setNumberOfRows(columns);
    } else {
      setNumberOfColumns(3);
      setNumberOfRows(3);
    }
  }, [in_play]);

  return (
    <>
      <div
        className={styles.board}
        style={assignInlineVars({
          [boardVars.columns]: numberOfColumns.toString(),
          [boardVars.rows]: numberOfRows.toString(),
        })}
      >
        <AnimatePresence>
          {in_play.map((card: CardType, i: number) => (
            <motion.div
              layout
              layoutDependency={{ in_play, numberOfColumns, numberOfRows }}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{ opacity: 0, y: -10 }}
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
