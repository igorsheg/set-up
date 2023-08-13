import * as React from "react";
import { COLORS, SHADINGS } from "../../consts";
import { shapeStyles } from "./Card.css"; // Adjust the path accordingly

function Icon(props: any) {
  return (
    <svg
      width={142}
      height={79}
      viewBox="0 0 142 79"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M134.737 28.894c9.206 4.39 9.085 17.537-.201 21.757L75.038 77.688a12 12 0 01-10.13-.093L7.264 50.105c-9.206-4.39-9.085-17.536.2-21.756L66.962 1.312a12 12 0 0110.13.093l57.646 27.49z" />
    </svg>
  );
}

type Props = {
  shading: number;
  color: number;
};

export default function Diamond(props: Props): React.ReactElement {
  const { color, shading } = props;

  const colorValue = COLORS[color];
  const shadingValue = SHADINGS[shading];

  return (
    <Icon
      className={shapeStyles({
        color: colorValue as any,
        shading: shadingValue as any,
      })}
    />
  );
}
