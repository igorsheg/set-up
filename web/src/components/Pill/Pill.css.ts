import { vars } from "@styles/index.css";
import { style, globalStyle } from "@vanilla-extract/css";

export const pillWrap = style({
  background: vars.colors.d12,
  color: vars.colors.d1,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  borderRadius: "30em",
  justifyContent: "space-between",
  top: vars.sizes.s6,
  position: "fixed",
  padding: `${vars.sizes.s3} ${vars.sizes.s3}`,
  zIndex: 2,
});

export const avatars = style({
  display: "flex",
});

export const avatar = style({
  position: "relative",
  width: vars.sizes.s8,
  height: vars.sizes.s8,
  maxHeight: vars.sizes.s8,
  maxWidth: vars.sizes.s8,
  borderRadius: "100%",

  "::after": {
    content: "",
    borderRadius: "100px",
    left: -1,
    top: -1,
    width: "calc(100% + 2px)",
    height: "calc(100% + 2px)",
    position: "absolute",
    border: `4px solid ${vars.colors.d12}`,
    userSelect: "none",
    pointerEvents: "none",
  },
  selectors: {
    [`${avatars} &:not(:nth-child(1))`]: {
      marginLeft: `-12px`,
    },
  },
});

export const avatarCount = style({
  background: vars.colors.d11,
});

export const avatarSpanRequest = style({
  "::after": {
    border: `3px solid ${vars.colors.sucess}`,
  },
});

export const avatarSpan = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  verticalAlign: "middle",
  overflow: "hidden",
  userSelect: "none",
  borderRadius: "100%",
  boxSizing: "border-box",
});

globalStyle(`${avatar} span img`, {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "inherit",
});

export const pillSection = style({});

globalStyle(`${pillSection} h5`, {
  ...vars.typography.s,
  fontWeight: "500",
  color: vars.colors.d9,
});

globalStyle(`${pillSection} span`, {
  ...vars.typography.s,
  fontWeight: "600",
});

export const requestButton = style({
  padding: `${vars.sizes.s2} ${vars.sizes.s4}`,
  border: `1px solid ${vars.colors.d11}`,
  borderRadius: "30px",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  transition: "all .12s ease",
  ":hover": {
    background: vars.colors.accent,
    border: `1px solid ${vars.colors.accent}`,
    transition: "all .12s ease",
  },
});
