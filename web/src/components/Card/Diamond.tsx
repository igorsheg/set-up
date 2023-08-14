export default function Diamond(props: any) {
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
        <clipPath id="diamod-shape">
          <path
            d="M7.27 1a2 2 0 013.46 0l6.93 12a2 2 0 01-1.73 3H2.07a2 2 0 01-1.73-3L7.27 1z"
            clipPath="url(#diamod-shape)"
            strokeWidth={6}
          />
        </clipPath>
      </defs>
      <path
        d="M7.27 1a2 2 0 013.46 0l6.93 12a2 2 0 01-1.73 3H2.07a2 2 0 01-1.73-3L7.27 1z"
        clipPath="url(#diamod-shape)"
      />
    </svg>
  );
}
