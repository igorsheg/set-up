import { vars } from "@styles/index.css";
import { style, globalStyle } from "@vanilla-extract/css";

export const pillWrap = style({
  background: vars.colors.d12,
  color: vars.colors.d1,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  borderRadius: "64px",
  alignItems: "center",
  justifyContent: "space-between",
  top: vars.sizes.s6,
  position: "fixed",
  padding: `${vars.sizes.s3} ${vars.sizes.s3}`,
  zIndex: 2,
});

export const avatarSpanRequest = style({
  "::after": {
    border: `3px solid ${vars.colors.sucess}`,
  },
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

export const notificationStyles = {
  icon: style({
    width: vars.sizes.s4,
    height: vars.sizes.s4,
  }),
};
