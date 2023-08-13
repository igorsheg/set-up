import { style } from "@vanilla-extract/css";
import { vars } from "@styles/index.css"; // Adjust the path accordingly

export const boardStyles = {
  board: style({
    display: "grid",
    gridTemplateRows: "repeat(3, 1fr)",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: vars.spacing.s4,
    padding: vars.spacing.s4,
    backgroundColor: vars.colors.background,
  }),
  row: style({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
    gap: vars.spacing.s2,
  }),
  lastSet: style({
    marginTop: vars.spacing.s4,
  }),
  button: style({
    padding: vars.spacing.s2,
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
