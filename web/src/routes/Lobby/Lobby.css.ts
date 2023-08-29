import { vars } from "@styles/index.css";
import { style, globalStyle } from "@vanilla-extract/css";

export const lobbyStyles = {
  container: style({
    zIndex: 1,
    width: "90vw",
    maxWidth: "450px",
    maxHeight: "85vh",
    padding: `${vars.sizes.s6} ${vars.sizes.s6}`,
  }),
};

globalStyle(`${lobbyStyles.container} > div > h1`, {
  ...vars.typography["7xl"],
});

export const lobbyButtonStyles = {
  container: style({
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: vars.sizes.s12,
    padding: `${vars.sizes.s2} ${vars.sizes.s6}`,
    borderRadius: vars.radius,
    boxShadow: `${vars.shadows.sm}, 0 0 0 1px ${vars.colorVars.d4}, inset 0px 0.6px 0px rgba(255,255,255, 0.1),inset 0px 1.2px 0px rgba(255, 255, 255, 0.1),inset -1.2px 0px 0px rgba(255, 255, 255, 0.04),inset 1.2px 0px 0px rgba(255, 255, 255, 0.04)`,
    background: vars.colors.background,
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    cursor: "pointer",
    willChange: "transform",

    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: `${vars.shadows.md},  0px 0px 0px 1px ${vars.colorVars.d6}`,
      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    },
    ":active": {
      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      boxShadow: `${vars.shadows.sm}, 0px 0px 0px 1px ${vars.colorVars.d6}`,
      transform: "translateY(2px)",
    },
  }),
};

globalStyle(`${lobbyButtonStyles.container} > div > p`, {
  ...vars.typography.xl,
  fontWeight: 550,
});
globalStyle(`${lobbyButtonStyles.container}:hover > div > p`, {
  color: vars.colors.accent,
});
globalStyle(`${lobbyButtonStyles.container}:hover >  svg`, {
  color: vars.colors.accent,
});
globalStyle(`${lobbyButtonStyles.container} > div > span`, {
  ...vars.typography.m,
  color: vars.colors.d10,
  fontWeight: 450,
});
