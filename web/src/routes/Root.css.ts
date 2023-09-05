import { vars } from "@styles/index.css";
import { style } from "@vanilla-extract/css";

export const rootRouteWrapStyles = style({
  display: "flex",
  overflow: "hidden",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  position: "relative",
  background: vars.colors.d1,
  minHeight: "100vh",
  minWidth: "100vw",
});

export const rootRouteContentStyles = style({
  width: "100%",
  overflowY: "auto",
  overflowX: "hidden",
  justifyContent: "center",
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  height: "100%",
});
