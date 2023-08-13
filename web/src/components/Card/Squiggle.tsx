import * as React from "react";

function Icon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" {...props}>
      <path d="M10 60 Q 40 10 70 60 T 130 60" strokeWidth="2" />
    </svg>
  );
}

type Props = {
  shading: string;
  color: string;
};

export default function Squiggle(props: Props): React.ReactElement {
  const { shading, color } = props;

  return <Icon className={`${color}-${shading}`} />;
}
