import * as React from "react";
import Icon from "/src/assets/squiggle.svg";

type Props = {
  shading: string;
  color: string;
};

export default function Squiggle(props: Props): React.ReactElement {
  const { shading, color } = props;

  return <Icon className={`${color}-${shading}`} />;
}
