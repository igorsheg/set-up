import { style } from "@vanilla-extract/css";
import { vars } from "@styles/index.css"; // Adjust the path accordingly

export const boardStyles = {
  board: style({
    display: "grid",
    zIndex: 1,
    // gridTemplateRows: "repeat(4, 1fr)",
    gridTemplateColumns: `repeat(3, ${vars.sizes.s13})`,
    columnGap: vars.sizes.s4,
    rowGap: vars.sizes.s4,
    width: "600px",
    justifyContent: "center",
  }),
  lastSet: style({
    marginTop: vars.sizes.s4,
  }),
  button: style({
    padding: vars.sizes.s2,
    // fontSize: vars.typography.base,
    color: vars.colors.text,
    backgroundColor: vars.colors.accent,
    border: `1px solid ${vars.colors.border}`,
    cursor: "pointer",
    transition: "background-color 0.2s ease-in-out",
    ":disabled": {
      backgroundColor: vars.colors.d5,
      cursor: "not-allowed",
    },
    ":hover": {
      backgroundColor: vars.colors.background,
    },
  }),
};
