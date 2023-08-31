import { vars } from "@styles/index.css";
import { style, globalStyle, keyframes } from "@vanilla-extract/css";

export const avatarGroup = style({
  display: "flex",
});

export const avatar = style({
  position: "relative",
  width: vars.sizes.s8,
  height: vars.sizes.s8,
  maxHeight: vars.sizes.s8,
  maxWidth: vars.sizes.s8,
  borderRadius: "100%",
});

export const avatarInaGroup = style({
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
    [`${avatarGroup} &:not(:nth-child(1))`]: {
      marginLeft: `-12px`,
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

export const ping = style({
  position: "absolute",
  width: vars.sizes.s4,
  height: vars.sizes.s4,
  borderRadius: "100%",
  left: 0,
  zIndex: 9,
  top: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "11px",
  background: vars.colors.background,
  color: vars.colors.accent,
  fontWeight: 550,

  "::after": {
    content: "",
    borderRadius: "100px",
    left: -1,
    top: -1,
    width: "calc(100% + 2px)",
    height: "calc(100% + 2px)",
    position: "absolute",
    border: `2px solid ${vars.colors.d12}`,
    userSelect: "none",
    pointerEvents: "none",
  },
});

export const restAvatar = style({
  background: vars.colors.d11,
});

const slideUpAndFade = keyframes({
  from: {
    opacity: 0,
    transform: "translateY(2px)",
  },
  to: {
    opacity: 1,
    transform: "translateY(0)",
  },
});

export const tooltip = {
  content: style({
    borderRadius: vars.radius,
    padding: vars.sizes.s2,
    background: vars.colorVars.a1,
    boxShadow: vars.shadows.sm,
    userSelect: "none",
    animationDuration: "400ms",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    willChange: "transform, opacity",
    selectors: {
      '&[data-state="delayed-open"][data-side="top"]': {
        animationName: slideUpAndFade,
      },
      '&[data-state="delayed-open"][data-side="bottom"]': {
        animationName: slideUpAndFade,
      },
    },
  }),
  arrow: style({
    fill: "white",
  }),
};
