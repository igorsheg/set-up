import { vars } from "@styles/index.css";
import { style, globalStyle } from "@vanilla-extract/css";

export const container = style({
  zIndex: 1,
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  overflow: "hidden",
  alignItems: "center",
  padding: `${vars.sizes.s12} 0`,
});

export const confetti = style({
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: 1000,
  width: "100vw",
  height: "100vh",
  userSelect: "none",
  pointerEvents: "none",
});

globalStyle(`${container}  h1`, {
  ...vars.typography["3xl"],
  fontWeight: 550,
});

globalStyle(`${container} > div > h1`, {
  ...vars.typography["3xl"],
});
