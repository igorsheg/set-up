import { vars } from "@styles/index.css";
import { style, globalStyle } from "@vanilla-extract/css";

export const container = style({
  zIndex: 5,
  position: "relative",
  background: vars.colors.background,
  border: `1px solid ${vars.colors.border}`,
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

globalStyle(`${container} > div > h1`, {
  ...vars.typography["3xl"],
});

globalStyle(`${container} > div > h1`, {
  ...vars.typography["3xl"],
});
