import { vars } from "@styles/index.css";
import { style, globalStyle } from "@vanilla-extract/css";

export const lobbyStyles = {
  container: style({
    zIndex: 1,
    width: "100vw",
    maxWidth: "39rem",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: `${vars.sizes.s12} ${vars.sizes.s6}`,
  }),
};

globalStyle(`${lobbyStyles.container} > div > h1`, {
  ...vars.typography["7xl"],
  fontWeight: 600,
  textAlign: "center",

  "@media": {
    "(max-width: 768px)": {
      ...vars.typography["5xl"],
    },
  },
});

export const lobbyButtonStyles = {
  container: style({
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${vars.sizes.s7} ${vars.sizes.s7}`,
    borderRadius: vars.radius,
    background: vars.colors.background,
    cursor: "pointer",
    borderColor: vars.colors.d6,
    borderWidth: "1px 1px 2px",
    borderStyle: "solid",
    gap: vars.sizes.s3,

    ":hover": {},
    ":active": {},
  }),
  hr: style({
    width: "100%",
    border: "none",
    height: "1px",
    background: vars.colors.d8,
    margin: `${vars.sizes.s2} 0`,
  }),
};

globalStyle(`${lobbyButtonStyles.container} > div > p`, {
  ...vars.typography.xl,
  fontWeight: 500,
});
globalStyle(`${lobbyStyles.container} > hr`, {
  width: "100%",
  border: "none",
  height: "1px",
  background: vars.colors.d8,
  margin: `${vars.sizes.s2} 0`,
});
globalStyle(`${lobbyButtonStyles.container}:hover > div > p`, {
  color: vars.colors.accent,
});
globalStyle(`${lobbyButtonStyles.container} >  svg`, {
  width: vars.sizes.s8,
});
globalStyle(`${lobbyButtonStyles.container}:hover >  svg`, {
  color: vars.colors.accent,
});
globalStyle(`${lobbyButtonStyles.container} > div > span`, {
  ...vars.typography.m,
  color: vars.colors.d11,
  fontWeight: 450,
});
