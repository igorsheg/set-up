import * as React from "react";

function Icon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" {...props}>
      <polygon points="50,5 95,50 50,95 5,50" strokeWidth="2" />
    </svg>
  );
}

type Props = {
  shading: string;
  color: string;
};

export default function Diamond(props: Props): React.ReactElement {
  const { color, shading } = props;

  return <Icon className={`${color}-${shading}`} />;
}
