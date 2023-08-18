import { vars } from "@styles/index.css";
import { style, globalStyle } from "@vanilla-extract/css";

export const pillWrap = style({
  background: vars.colors.d12,
  color: vars.colors.d1,
  height: vars.sizes.s10,
  display: "flex",
  borderRadius: "30em",
  top: vars.sizes.s6,
  position: "fixed",
  padding: `0 ${vars.sizes.s6}`,
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2,
});

export const avatars = style({
  display: "flex",
});

export const avatar = style({
  position: "relative",
  width: vars.sizes.s8,
  height: vars.sizes.s8,

  "::after": {
    content: "",
    borderRadius: "100px",
    left: 0,
    width: "100%",
    height: "100%",
    position: "absolute",
    border: `3px solid ${vars.colors.d12}`,
    userSelect: "none",
    pointerEvents: "none",
  },
  selectors: {
    [`${avatars} &:not(:nth-child(1))`]: {
      marginLeft: `-10px`,
    },
  },
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
