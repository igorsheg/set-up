import { style } from "@vanilla-extract/css";
import { vars } from "@styles/index.css"; // Adjust the path accordingly

export const cardStyles = {
  card: style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: vars.spacing.s2,
    backgroundColor: vars.colors.card,
    boxShadow: vars.shadows.sm,
    cursor: "pointer",
    transition: "box-shadow 0.2s ease-in-out",
    ":hover": {
      boxShadow: vars.shadows.md,
    },
  }),
  selected: style({
    borderColor: vars.colors.accent,
    borderWidth: "2px",
    borderStyle: "solid",
  }),
  thumbnail: style({
    cursor: "default",
  }),
  hidden: style({
    visibility: "hidden",
  }),
};
