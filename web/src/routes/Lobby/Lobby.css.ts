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

globalStyle(`${lobbyStyles.container} > h1`, {
  ...vars.typography["5xl"],
});

export const lobbyButtonStyles = {
  container: style({
    width: vars.sizes.s17,
    height: vars.sizes.s12,
    padding: `${vars.sizes.s2} ${vars.sizes.s6}`,
    borderRadius: vars.radius,
    boxShadow: `${vars.shadows.md},  0px 0px 0px 1px ${vars.colors.d5}`,
    background: vars.colors.background,
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    cursor: "pointer",

    ":active": {
      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      boxShadow: `0px 0px 0px 2px ${vars.colors.accent}`,
      transform: "translateY(2px)",
    },

    ":hover": {
      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    },
  }),
};

globalStyle(`${lobbyButtonStyles.container} > p`, {
  ...vars.typography.xl,
});
globalStyle(`${lobbyButtonStyles.container} > span`, {
  ...vars.typography.m,
  color: vars.colors.d10,
});
