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

export const avatar = style({
  width: "100%",
  height: "100%",
});

globalStyle(`${avatar} span`, {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  verticalAlign: "middle",
  overflow: "hidden",
  userSelect: "none",
  width: vars.sizes.s7,
  height: vars.sizes.s7,
  boxShadow: `0 0 0 5px ${vars.colors.d12}`,
  borderRadius: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.055)",
});

globalStyle(`${avatar} span img`, {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "inherit",
});
