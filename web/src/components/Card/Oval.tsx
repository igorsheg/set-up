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
        <clipPath id="oval-shape">
          <circle
            cx={9}
            cy={9}
            r={9}
            clipPath="url(#oval-shape)"
            strokeWidth={12}
          />
        </clipPath>
      </defs>
      <circle cx={9} cy={9} r={9} clipPath="url(#oval-shape)" />
    </svg>
  );
}
