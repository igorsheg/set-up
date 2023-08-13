import * as React from "react";
import Icon from "../../assets/diamond.svg";

type Props = {
  shading: string;
  color: string;
};

export default function Diamond(props: Props): React.ReactElement {
  const { color, shading } = props;

  return <Icon className={`${color}-${shading}`} />;
}
