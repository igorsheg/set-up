import * as React from "react";
import { COLORS, SHADINGS } from "../../consts";

function Icon(props) {
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
  shading: keyof typeof SHADINGS;
  color: keyof typeof COLORS;
};

export default function Diamond(props: Props): React.ReactElement {
  const { color, shading } = props;

  const colorClass = COLORS[color];
  const shadingClass = SHADINGS[shading];

  return <Icon className={`${colorClass} ${shadingClass}`} />;
}
