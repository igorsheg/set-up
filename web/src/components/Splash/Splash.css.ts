import { vars } from "@styles/index.css";
import { createVar, style, keyframes, globalStyle } from "@vanilla-extract/css";

const highlightColor = createVar();
const highlightColorAlt = createVar();

const bgRotate = keyframes({
  "100%": {
    transform: "rotate(1turn)",
  },
});

const float = keyframes({
  "0%": {
    transform: "translate3d(0, 0, 0) rotate(10deg)",
    boxShadow: `0 0 6px ${highlightColorAlt}`,
  },
  "50%": {
    transform: "translate3d(0, -10px, 0) rotate(10deg)",
    boxShadow: `0 0 20px ${highlightColorAlt}`,
  },
  "100%": {
    transform: "translate3d(0, 0, 0) rotate(10deg)",
    boxShadow: `0 0 6px ${highlightColorAlt}`,
  },
});

export const container = style({
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
  borderRadius: "25px",
  padding: vars.sizes.s3,

  cursor: "pointer",
  position: "absolute",
  overflow: "hidden",
  gap: vars.sizes.s1,
  willChange: "transform, box-shadow, background-color",
  animation: `${float} 4s ease-in-out infinite`,

  "::after": {
    content: '""',
    position: "absolute",
    zIndex: -1,
    left: "5px",
    top: "5px",
    width: "calc(100% - 10px)",
    height: "calc(100% - 10px)",
    backgroundColor: vars.colors.foregorund,
    borderRadius: "20px",
  },
  backgroundColor: "transparent",
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
});

export const shape = style({
  position: "absolute",
});

globalStyle(`${shape} > svg`, {
  height: "100%",
});

export const rect = style({
  transform: "rotate(-15deg)",
  width: vars.sizes.s7,
  marginBottom: vars.sizes.s2,
  zIndex: 3,
});
export const triangle = style({
  transform: "rotate(5deg)",
  marginLeft: vars.sizes.s7,
  width: vars.sizes.s6,
});
export const circle = style({
  transform: "rotate(9.47919 72.0019 65.7797)",
  width: vars.sizes.s5,
  marginRight: vars.sizes.s7,
  marginTop: vars.sizes.s5,
});
