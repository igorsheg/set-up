import * as React from "react";

function Icon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" {...props}>
      <ellipse cx="50" cy="50" rx="40" ry="25" strokeWidth="2" />
    </svg>
  );
}

type Props = {
  shading: string;
  color: string;
};

export default function Oval(props: Props): React.ReactElement {
  const { shading, color } = props;

  return <Icon className={`${color}-${shading}`} />;
}
