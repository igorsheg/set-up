import * as React from "react";
import { Data, Card as CardType, Player } from "../../types";
import Card from "@components/Card/Card";
import { boardVars, boardStyles as styles } from "./Board.css"; // Adjust the path as needed
import { AnimatePresence, motion } from "framer-motion";
import { assignInlineVars } from "@vanilla-extract/dynamic";

type Props = {
  data: Data;
  handleMove: (cards: CardType[]) => void;
  handleRequest: () => void;
  selected: CardType[];
  setSelected: React.Dispatch<React.SetStateAction<CardType[]>>;
};

export default function Board(props: Props): React.ReactElement {
  const { data, handleMove, handleRequest, selected, setSelected } = props;

  const { in_play, last_player, last_set, players, remaining } = data;

  const handleClick = (card: CardType): void => {
    const i = selected.indexOf(card);
    if (i === -1) {
      const slctd = [...selected, card];
      if (slctd.length === 3) {
        handleMove(slctd);
        setSelected([]);
      } else {
        setSelected(slctd);
      }
    } else {
      setSelected(selected.filter((c) => c !== card));
    }
  };

  const columns = in_play[0]?.length || 0;
  const rows = in_play.length;

  return (
    <>
      <div
        className={styles.board}
        style={assignInlineVars({
          [boardVars.columns]: `${columns}`,
          [boardVars.rows]: `${rows}`,
        })}
      >
        <AnimatePresence custom="wait">
          {in_play.map((cards: CardType[], i: number) =>
            cards.map((card: CardType, j: number) => (
              <motion.div
                layout
                key={`${card.color}${card.shape}${card.number}${card.shading}${j}`}
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
                  delay: i * 0.05,
                }}
              >
                <Card
                  selected={selected.indexOf(card) !== -1}
                  onClick={(): void => handleClick(card)}
                  card={card}
                  hidden={card.color === null}
                />
              </motion.div>
            )),
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
