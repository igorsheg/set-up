import { vars } from "@styles/index.css";
import { keyframes, style, styleVariants } from "@vanilla-extract/css";

export const single = style({});

export const large = style({});

export const container = style({
  display: "inline-flex",
  flexWrap: "nowrap",
  overflow: "hidden",
});

export const colors = styleVariants({
  accent: {},
  white: {},
  dark: {},
});

const dotAnimation = keyframes({
  "0%": {
    opacity: 0.4,
  },
  "20%": {
    opacity: 1,
  },
  to: {
    opacity: 0.4,
  },
});

export const dot = style({
  borderRadius: "50%",
  selectors: {
    [`${large} &`]: {
      width: 8,
      height: 8,
    },
    "&:not(:last-child)": {
      marginRight: 4,
    },
    [`${large} &:not(:last-child)`]: {
      marginRight: 20,
    },
    "&:nth-child(2)": {
      animationDelay: "0.2s",
    },
    "&:nth-child(3)": {
      animationDelay: "0.4s",
    },
    [`${single} &:nth-child(2), ${single} &:nth-child(3)`]: {
      display: "none",
    },
    [`${single} &`]: {
      width: 16,
      height: 16,
      marginRight: 0,
    },
    [`${large}${single} &`]: {
      width: 32,
      height: 32,
      marginRight: 0,
    },
    [`${colors.accent} &`]: {
      background: vars.colors.accent,
    },
    [`${colors.white} &`]: {
      background: vars.colorVars.d1,
    },
    [`${colors.dark} &`]: {
      background: vars.colorVars.d12,
    },
  },
  animation: `${dotAnimation} 1s both ease-in-out infinite`,
});
