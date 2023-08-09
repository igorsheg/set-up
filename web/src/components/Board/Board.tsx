import React from "react";
import * as styles from "./Board.css"; // Import from absolute path
import { Color } from "@models/card"; // Import from absolute path
import { Card, GameSession } from "../../types/internal";

const getColorStyle = (color: Color) => {
  switch (color) {
    case Color.Pink:
      return styles.pinkCard;
    case Color.Blue:
      return styles.blueCard;
    case Color.Yellow:
      return styles.yellowCard;
    // Add other cases as needed
    default:
      return "";
  }
};

interface BoardProps {
  data: GameSession;
  handleMove: (cards: Card[]) => void;
  handleRequest: () => void;
  selected: Card[];
  setSelected: (selected: Card[]) => void;
}

const Board: React.FC<BoardProps> = ({
  data,
  handleMove,
  handleRequest,
  selected,
  setSelected,
}) => {
  // Function to handle card selection
  const selectCard = (card: Card) => {
    // Logic for selecting or deselecting a card
    if (selected.includes(card)) {
      setSelected(selected.filter((c) => c !== card));
    } else {
      setSelected([...selected, card]);
    }
  };

  // Function to handle making a move
  const makeMove = () => {
    if (selected.length === 3) {
      handleMove(selected);
      setSelected([]); // Clear the selection
    }
  };

  return (
    <div className={styles.boardGridContainer}>
      {data.in_play.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          {row.map((card, index) => (
            <div
              key={index}
              className={`${styles.card} ${getColorStyle(card.color)} ${selected.includes(card) ? styles.selected : ""
                }`}
              onClick={() => selectCard(card)}
            >
              <div>{card.color}</div>
              <div>{card.number}</div>
              <div>{card.shading}</div>
              <div>{card.symbol}</div>
            </div>
          ))}
        </div>
      ))}
      <button type="button" onClick={makeMove}>
        Make Move
      </button>
      <button type="button" onClick={handleRequest}>
        Request Cards
      </button>
    </div>
  );
};

export default Board;
