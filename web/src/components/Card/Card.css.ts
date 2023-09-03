import { style, keyframes, createVar } from "@vanilla-extract/css";
import { vars } from "@styles/index.css"; // Adjust the path accordingly
import { recipe } from "@vanilla-extract/recipes";

const highlightColor = createVar();
const highlightColorAlt = createVar();

const bgRotate = keyframes({
  "100%": {
    transform: "rotate(1turn)",
  },
});
const glow = keyframes({
  "0%": { boxShadow: `0 0 6px ${highlightColorAlt}` },
  to: { boxShadow: `0 0 20px ${highlightColorAlt}` },
});

export const cardStyles = {
  card: style({
    vars: {
      [highlightColor]: "rgb(237, 138, 92)",
      [highlightColorAlt]: "rgb(255, 194, 145)",
    },
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    height: vars.sizes.s12,
    width: vars.sizes.s12,
    borderRadius: "16px",
    padding: vars.sizes.s3,
    boxShadow: `${vars.shadows.extrude}, inset 0 0 0 2px ${vars.colors.d6}`,
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    gap: vars.sizes.s1,
    backgroundColor: vars.colors.foregorund,
    willChange: "transform, box-shadow, background-color",

    "@media": {
      "(max-width: 768px)": {
        height: "78px",
        width: "78px",
      },
    },

    ":active": {
      transform: "translateY(2px)",
      boxShadow: `inset 0 0 0 2px ${vars.colors.d6}`,
    },

    "::after": {
      content: '""',
      position: "absolute",
      zIndex: -1,
      left: "4px",
      top: "4px",
      width: "calc(100% - 8px)",
      height: "calc(100% - 8px)",
      backgroundColor: vars.colors.foregorund,
      borderRadius: "12px",
    },
  }),
  selected: style({
    backgroundColor: "transparent",
    animation: `${glow} 2s ease infinite alternate`,
    willChange: "box-shadow",
    "::before": {
      content: '""',
      position: "absolute",
      zIndex: -2,
      left: "-50%",
      top: "-50%",
      width: "200%",
      height: "200%",
      backgroundColor: "#000",
      backgroundRepeat: "no-repeat",
      backgroundSize: "100% 100%, 50% 50%",
      backgroundPosition: "0 0, 100% 0, 100% 100%, 0 100%",
      // @ts-ignore: complain about gradient
      background: `conic-gradient(${highlightColor},${highlightColorAlt},${highlightColor},${highlightColorAlt},${highlightColor},${highlightColorAlt},${highlightColor},${highlightColorAlt},${highlightColor},${highlightColorAlt},${highlightColor});`,
      animation: `${bgRotate} 2s linear infinite`,
      willChange: "transform",
    },
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
    marginTop: `calc(${1} * -24px)`,
    marginLeft: `calc(${1} * -14px)`,
    marginRight: `calc(${1} * -14px)`,
  }),
  leftRight: style({
    marginTop: `calc(${1} * 24px)`,
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
        width: vars.sizes.s9,
        height: vars.sizes.s9,
      },
      2: {
        width: vars.sizes.s8,
        height: vars.sizes.s8,
      },
      3: {
        width: vars.sizes.s6,
        height: vars.sizes.s6,
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
        width: vars.sizes.s9,
        height: vars.sizes.s9,
      },
      2: {
        width: vars.sizes.s8,
        height: vars.sizes.s8,
      },
      3: {
        width: vars.sizes.s7,
        height: vars.sizes.s7,
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
