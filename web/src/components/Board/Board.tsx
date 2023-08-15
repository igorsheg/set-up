import * as React from "react";
import { Data, Card as CardType, Player } from "../../types";
import Card from "@components/Card/Card";
import { boardStyles as styles } from "./Board.css"; // Adjust the path as needed

type Props = {
  data: Data;
  handleMove: (cards: CardType[]) => void;
  handleRequest: () => void;
  selected: CardType[];
  setSelected: React.Dispatch<React.SetStateAction<CardType[]>>;
};

/* eslint react/no-array-index-key:0 */
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

  return (
    <>
      <div className={styles.board}>
        {in_play.map((cards: CardType[]) =>
          cards.map((card: CardType, j: number) => (
            <Card
              selected={selected.indexOf(card) !== -1}
              key={`${card.color}${card.shape}${card.number}${card.shading}${j}`}
              onClick={(): void => handleClick(card)}
              card={card}
              hidden={card.color === null}
            />
          )),
        )}
      </div>
      <div>
        <div className={styles.lastSet}>
          {last_player && `${last_player} found a set: `}
          {last_set &&
            last_set.map((card: CardType) => (
              <Card
                selected={false}
                key={`${card.color}${card.shape}${card.number}${card.shading}`}
                card={card}
                hidden={false}
              />
            ))}
        </div>
        <button
          type="button"
          onClick={(): void => handleRequest()}
          disabled={remaining === 0}
          className={styles.button}
        >
          Request more cards
        </button>
        <div>{`Remaining cards: ${remaining}`}</div>
        {players.map((player: Player) => (
          <div key={player.id}>
            {`${player.name}: ${player.score} ${player.request ? "Requested more cards" : ""
              }`}
          </div>
        ))}
      </div>
    </>
  );
}
