import { SVGProps } from "react";

const Oval: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <clipPath id="oval-shape">
          <circle
            cx={9}
            cy={9}
            r={9}
            clipPath="url(#oval-shape)"
            strokeWidth="3.5999999999999996"
          />
        </clipPath>
      </defs>
      <circle
        cx={9}
        cy={9}
        r={9}
        clipPath="url(#oval-shape)"
        strokeWidth="3.5999999999999996"
      />
    </svg>
  );
};

export default Oval;
