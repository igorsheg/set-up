import { vars } from "@styles/index.css";
import { style, keyframes, globalStyle } from "@vanilla-extract/css";

const slideUpAndFade = keyframes({
  from: {
    opacity: 0,
    transform: "translateY(2px)",
  },
  to: {
    opacity: 1,
    transform: "translateY(0px)",
  },
});

export const dropdownMenuContent = style({
  minWidth: "220px",
  backgroundColor: vars.colors.background,
  borderRadius: vars.radius.base,
  padding: vars.sizes.s2,
  boxShadow: `0 0 0 1px ${vars.colorVars.d5}, ${vars.shadows.lg}`,
  animationDuration: "230ms",
  animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
  willChange: "transform, opacity",

  selectors: {
    ["&[data-side=bottom]"]: {
      animationName: slideUpAndFade,
    },
  },
});

export const dropdownMenuItem = style({
  ...vars.typography.base,
  borderRadius: vars.radius.sm,
  display: "flex",
  alignItems: "center",
  height: vars.sizes.s8,
  position: "relative",
  userSelect: "none",
  outline: "none",
  ":hover": {
    backgroundColor: vars.colorVars.d4,
    cursor: "pointer",
  },
  selectors: {
    ["&[data-highlighted]"]: {
      backgroundColor: vars.colorVars.d4,
    },
  },
});
export const dropdownMenuItemIcon = style({
  width: vars.sizes.s8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

globalStyle(`${dropdownMenuItemIcon} > svg`, {
  display: "block",
  width: "18px",
  height: "18px",
  verticalAlign: "middle",
});

export const dropwdownMenuArrow = style({
  fill: vars.colorVars.d1,
});
