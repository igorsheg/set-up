import { vars } from "@styles/index.css";
import { style, globalStyle } from "@vanilla-extract/css";

export const container = style({
  zIndex: 5,
  position: "relative",
  background: vars.colors.background,
  borderRadius: vars.radius.base,
  width: "90vw",
  maxWidth: "450px",
  maxHeight: "85vh",
  padding: `${vars.sizes.s9} ${vars.sizes.s9}`,
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
