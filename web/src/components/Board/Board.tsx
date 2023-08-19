import * as React from "react";
import { Data, Card as CardType, Player } from "../../types";
import Card from "@components/Card/Card";
import { boardVars, boardStyles as styles } from "./Board.css"; // Adjust the path as needed
import { AnimatePresence, motion } from "framer-motion";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { GameState, setSelected } from "../../store";

type Props = {
  data: Data;
  handleMove: (cards: CardType[]) => void;
  handleRequest: () => void;
  selected: CardType[];
  // setSelected: React.Dispatch<React.SetStateAction<CardType[]>>;
};

export default function Board(props: Props): React.ReactElement {
  const { data, handleMove, handleRequest } = props;
  const [numberOfColumns, setNumberOfColumns] = React.useState(3);
  const [numberOfRows, setNumberOfRows] = React.useState(4);

  const dispatch = useDispatch();
  const selected = useSelector(
    (state: { game: GameState }) => state.game.selected,
  );

  const { in_play, last_player, last_set, players, remaining } = data;

  const handleClick = (card: CardType): void => {
    const i = selected.indexOf(card);
    if (i === -1) {
      const slctd = [...selected, card];
      if (slctd.length === 3) {
        dispatch(setSelected(slctd)); // Clearing the selected cards after a move
        handleMove();
        dispatch(setSelected([])); // Clearing the selected cards after a move
        // setSelected([]);
      } else {
        dispatch(setSelected(slctd)); // Clearing the selected cards after a move
        // setSelected(slctd);
      }
    } else {
      dispatch(setSelected(selected.filter((c) => c !== card)));
      // setSelected(selected.filter((c) => c !== card));
    }
  };

  React.useEffect(() => {
    if (in_play.length > 18) {
      const columns = Math.ceil(in_play.length / 3);
      setNumberOfColumns(columns);
      setNumberOfRows((r) => r++);
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
              key={`${card.color}${card.shape}${card.number}${card.shading}${i}`}
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
                stiffness: 500,
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
