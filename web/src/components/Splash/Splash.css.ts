import { vars } from "@styles/index.css";
import { createVar, style, keyframes, globalStyle } from "@vanilla-extract/css";

const highlightColor = createVar();
const highlightColorAlt = createVar();

const colors = [
  highlightColor,
  highlightColorAlt,
  highlightColor,
  highlightColorAlt,
  highlightColor,
  highlightColorAlt,
  highlightColor,
  highlightColorAlt,
  highlightColor,
  highlightColorAlt,
  highlightColor,
].join(",");
const gradient = `conic-gradient(${colors})`;

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
    background: gradient,
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

export const splashScreenWrap = style({
  display: "flex",
  overflow: "hidden",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  position: "absolute",
  top: 0,
  left: 0,
  minHeight: "100vh",
  minWidth: "100vw",
  backgroundImage:
    "radial-gradient(ellipse 90% 90% at 80% -20%, rgba(247, 104, 8, 0.4), rgba(255, 255, 255, 0))",
  "::after": {
    content: "",
    zIndex: 0,
    userSelect: "none",
    pointerEvents: "none",
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundRepeat: "repeat",
    opacity: 0.3,
    backgroundSize: "250px 250px",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
  },
});

export const splashScreenContentWrap = style({
  width: vars.sizes.s17,
  height: vars.sizes.s17,
  borderRadius: "40px",
  "@media": {
    "(max-width: 768px)": {
      width: vars.sizes.s13,
      height: vars.sizes.s13,
      borderRadius: "20px",
    },
  },
});

export const splashScreenContentShapes = style({
  width: vars.sizes.s13,
  height: vars.sizes.s13,
  "@media": {
    "(max-width: 768px)": {
      width: vars.sizes.s8,
      height: vars.sizes.s8,
    },
  },
});

export const splashMask = style({
  position: "absolute",
  width: "100vw",
  height: "100vh",
  backgroundColor: "white",
  overflow: "hidden",
  zIndex: 2,
  clipPath: "circle(150px at 50% 50%)",

  "@media": {
    "(max-width: 768px)": {
      clipPath: "circle(75px at 50% 50%)",
    },
  },
});

export const splashContent = style({
  position: "absolute",
  top: "50%",
  left: "50%",
  width: "200px",
  height: "200px",
  transform: "translate(-50%, -50%)",
  backgroundColor: "white",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

export const revealContent = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100vw",
  position: "relative",
  height: "100vh",
});
