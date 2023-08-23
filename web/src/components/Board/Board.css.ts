import { style, createVar } from "@vanilla-extract/css";
import { vars } from "@styles/index.css"; // Adjust the path accordingly

export const boardVars = {
  columns: createVar(),
};

export const boardStyles = {
  board: style({
    display: "grid",
    zIndex: 1,
    gridTemplateColumns: `repeat(${boardVars.columns}, 104px)`,
    columnGap: vars.sizes.s3,
    rowGap: vars.sizes.s3,
    width: "100%",
    overflow: "auto",
    padding: ` ${vars.sizes.s13} 0`,
    justifyContent: "center",
    "@media": {
      "(max-width: 768px)": {
        gridTemplateColumns: `repeat(3, "104px")`,
      },
      "(max-width: 480px)": {
        gridTemplateColumns: `repeat(1, "104px")`,
      },
    },
  }),
  lastSet: style({
    marginTop: vars.sizes.s4,
  }),
  button: style({
    padding: vars.sizes.s2,
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
