import { vars } from "@styles/index.css";
import { style } from "@vanilla-extract/css";

export const lobbyStyles = {
  container: style({
    zIndex: 1,
    backgroundColor: vars.colors.background,
    borderRadius: vars.radius,
    boxShadow: vars.shadows.md,
    border: `1px solid ${vars.colorVars.d7}`,
    width: "90vw",
    maxWidth: "450px",
    maxHeight: "85vh",
    padding: `${vars.sizes.s6} ${vars.sizes.s6}`,
  }),
};
