import * as React from "react";
import { Card as CardType } from "../../types";
import { COLORS, SHADINGS, SHAPES } from "../../consts";
import Diamond from "./Diamond";
import Oval from "./Oval";
import Squiggle from "./Squiggle";
import { cardStyles as styles, shapeWrap, shapeStyles } from "./Card.css";
import { cx } from "../../util/cx";

type Props = {
  card: CardType;
  hidden: boolean;
  onClick?: () => void;
  selected: boolean;
};

const SHAPE_COMPONENTS = {
  [SHAPES.DIAMOND]: Diamond,
  [SHAPES.OVAL]: Oval,
  [SHAPES.SQUIGGLE]: Squiggle,
};

export default function Card(props: Props): React.ReactElement {
  const { card, hidden, onClick, selected } = props;
  const { color, shape, number, shading } = card;
  const threeElements = number + 1 === 3;

  if (hidden) return <div className="hidden card" />;

  const ShapeComponent = SHAPE_COMPONENTS[shape];
  const element = (
    <ShapeComponent
      className={shapeStyles({
        shading: SHADINGS[shading] as "solid" | "striped" | "outlined", // TODO: fix typings
        color: COLORS[color] as "green" | "purple" | "red",
        size: (number + 1) as 1 | 2 | 3,
      })}
    />
  );

  const elements = [...Array(number + 1)].map((_, index) => {
    const isMiddle = index === 1; // 3 elements, middle one is at index 1
    return (
      <div
        key={`${color}-${shape}-${number}-${index}`}
        className={`${shapeWrap({ size: (number + 1) as 1 | 2 | 3 })} ${!threeElements ? "" : isMiddle ? styles.middle : styles.leftRight
          }`}
      >
        {element}
      </div>
    );
  });

  return (
    <div
      className={cx(
        styles.card,
        selected && styles.selected,
        !onClick && styles.thumbnail,
      )}
      onClick={onClick}
      onKeyDown={onClick}
      role="button"
      tabIndex={0}
    >
      {elements}
    </div>
  );
}
