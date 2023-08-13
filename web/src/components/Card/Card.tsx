import * as React from "react";
import { Card as CardType } from "../../types";
import { COLORS, SHAPES, SHADINGS } from "../../consts";
import Diamond from "./Diamond";
import Oval from "./Oval";
import Squiggle from "./Squiggle";
import { cardStyles as styles } from "./Card.css"; // Adjust the path as needed

type Props = {
  card: CardType;
  hidden: boolean;
  onClick?: () => void;
  selected: boolean;
};

export default function Card(props: Props): React.ReactElement {
  const { card, hidden, onClick, selected } = props;

  const { color, shape, number, shading } = card;

  if (hidden) return <div className="hidden card" />;

  let element: React.ReactElement;
  switch (shape) {
    case SHAPES.DIAMOND:
      element = <Diamond color={color} shading={shading} />;
      break;
    case SHAPES.OVAL:
      element = <Oval color={color} shading={shading} />;
      break;
    case SHAPES.SQUIGGLE:
      element = <Squiggle color={color} shading={shading} />;
      break;
    default:
      throw new Error("Undefined shape");
  }
  const elements = [...Array(number + 1).keys()].map(() => element);

  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ""} ${onClick ? "" : styles.thumbnail
        }`}
      onClick={onClick}
      onKeyDown={onClick}
      role="button"
      tabIndex={0}
    >
      {elements}
    </div>
  );
}
