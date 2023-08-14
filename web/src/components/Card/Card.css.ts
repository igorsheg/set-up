import { style } from "@vanilla-extract/css";
import { vars } from "@styles/index.css"; // Adjust the path accordingly
import { recipe } from "@vanilla-extract/recipes";

export const cardStyles = {
  card: style({
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    height: vars.spacing.s13,
    width: vars.spacing.s13,
    padding: vars.spacing.s2,
    backgroundColor: vars.colors.card,
    boxShadow: vars.shadows.sm,
    cursor: "pointer",
    gap: vars.spacing.s2,
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
  middle: style({
    marginTop: `calc(${1} * -36px)`,
    marginLeft: `calc(${1} * -15px)`,
    marginRight: `calc(${1} * -15px)`,
  }),
  leftRight: style({
    marginTop: `calc(${1} * ${vars.spacing.s7})`,
  }),
};

export const shapeWrap = recipe({
  base: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  variants: {
    size: {
      1: {
        width: vars.spacing.s10,
        height: vars.spacing.s10,
      },
      2: {
        width: vars.spacing.s8,
        height: vars.spacing.s8,
      },
      3: {
        width: vars.spacing.s7,
        height: vars.spacing.s7,
      },
    },
  },
});

export const shapeStyles = recipe({
  base: {
    stroke: "currentcolor",
    fill: "currentcolor",
    width: "100%",
    height: "100%",
  },

  variants: {
    color: {
      red: { color: "rgb(248, 80, 62)" },
      purple: { color: "rgb(65, 78, 155)" },
      green: { color: "rgb(61, 119, 115)" },
    },
    size: {
      1: {
        width: vars.spacing.s10,
        height: vars.spacing.s10,
      },
      2: {
        width: vars.spacing.s8,
        height: vars.spacing.s8,
      },
      3: {
        width: vars.spacing.s7,
        height: vars.spacing.s7,
      },
    },
    shading: {
      outlined: {
        fillOpacity: 0,
      },
      striped: {
        fillOpacity: 0.3,
      },
      solid: {},
    },
  },
});
