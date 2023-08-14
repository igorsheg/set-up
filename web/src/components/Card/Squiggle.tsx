export default function Icon(props: any) {
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
        <clipPath id="squiggle-shape">
          <rect
            width={16}
            height={16}
            rx={3}
            x={1}
            y={1}
            clipPath="url(#squiggle-shape)"
            strokeWidth={2.571428571428571}
          />
        </clipPath>
      </defs>
      <rect
        width={16}
        height={16}
        rx={3}
        x={1}
        y={1}
        clipPath="url(#squiggle-shape)"
      />
    </svg>
  );
}
