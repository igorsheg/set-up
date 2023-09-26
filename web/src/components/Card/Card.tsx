import * as React from "react";
import { Card as CardType } from "../../types";
import { COLORS, SHADINGS, SHAPES } from "../../consts";
import Diamond from "./Diamond";
import Oval from "./Oval";
import Squiggle from "./Squiggle";
import { cardStyles as styles, shapeWrap, shapeStyles } from "./Card.css";
import { cx } from "../../util/cx";
import { vars } from "@styles/index.css";

type Props = {
  card: CardType;
  onClick?: () => void;
  selected?: boolean;
  small?: boolean;
};

const SHAPE_COMPONENTS = {
  [SHAPES.DIAMOND]: Diamond,
  [SHAPES.OVAL]: Oval,
  [SHAPES.SQUIGGLE]: Squiggle,
};

export default function Card(props: Props): React.ReactElement {
  const { card, onClick, selected } = props;
  const { color, shape, number, shading } = card;
  const threeElements = number + 1 === 3;

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
        className={`${shapeWrap({ size: (number + 1) as 1 | 2 | 3 })} ${
          !threeElements ? "" : isMiddle ? styles.middle : styles.leftRight
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
      onKeyDown={(e) => e.key === "Enter" && onClick && onClick()}
      role="button"
      tabIndex={0}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
          alignItems: "center",
          padding: vars.sizes.s3,
          gap: vars.sizes.s1,
          position: "relative",
          transform: props.small ? "scale(.9)" : undefined,
        }}
      >
        {elements}
      </div>
    </div>
  );
}
