import { vars } from "@styles/index.css";
import { style, globalStyle } from "@vanilla-extract/css";

export const gamePageStyles = style({
  height: "100vh",
  width: "100vw",
  display: "flex",
  overflow: "hidden",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  position: "relative",
});

export const gameOverStyles = {
  container: style({
    zIndex: 5,
    position: "relative",
    background: vars.colors.background,
    border: `1px solid ${vars.colors.border}`,
    borderRadius: vars.radius,
    width: "90vw",
    maxWidth: "450px",
    maxHeight: "85vh",
    padding: `${vars.sizes.s6} ${vars.sizes.s6}`,
  }),
};

globalStyle(`${gameOverStyles.container} > div > h1`, {
  ...vars.typography["3xl"],
});
