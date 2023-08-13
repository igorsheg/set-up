import { style } from "@vanilla-extract/css";
import { vars } from "@styles/index.css"; // Adjust the path accordingly
import { recipe } from "@vanilla-extract/recipes";

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

  ".outlined": style({
    fill: "red",
    stroke: "outlined",
  }),
  "red-striped": style({
    fill: "red",
    stroke: "striped",
  }),
};

export const colors = {
  red: style({ fill: "red" }),
  purple: style({ fill: "purple" }),
  green: style({ fill: "green" }),
};

export const shadings = {
  outlined: style({ stroke: "outlined" }),
  striped: style({ stroke: "striped" }),
  solid: style({ stroke: "solid" }),
};

export const shapeStyles = recipe({
  base: {
    stroke: "currentcolor",
    fill: "currentcolor",
  },

  variants: {
    color: {
      red: { color: "rgb(248, 80, 62)" },
      purple: { color: "rgb(65, 78, 155)" },
      green: { color: "rgb(61, 119, 115)" },
    },
    shading: {
      outlined: {
        fillOpacity: 0,
        strokeWidth: "4px",
      },
      striped: {
        fillOpacity: 0.3,
      },
      solid: {},
    },
  },
});
