import * as React from "react";
import { COLORS, SHADINGS } from "../../consts";
import { shapeStyles } from "./Card.css"; // Adjust the path accordingly
function Icon(props: any) {
  return (
    <svg
      width={67}
      height={67}
      viewBox="0 0 67 67"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width={67} height={67} rx={12} />
    </svg>
  );
}

type Props = {
  shading: number;
  color: number;
};

export default function Squiggle(props: Props): React.ReactElement {
  const { shading, color } = props;

  const colorValue = COLORS[color];
  const shadingValue = SHADINGS[shading];

  return (
    <div className={shapeStyles({ color: colorValue as any })}>
      <Icon className={shapeStyles({ shading: shadingValue as any })} />
    </div>
  );
}
