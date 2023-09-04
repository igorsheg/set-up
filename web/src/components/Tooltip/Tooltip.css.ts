import { vars } from "@styles/index.css";
import { style, keyframes } from "@vanilla-extract/css";

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
    borderRadius: vars.radius.sm,
    padding: vars.sizes.s2,
    background: vars.colorVars.a1,
    boxShadow: `0 0 0 1px ${vars.colorVars.d5}, ${vars.shadows.sm}`,
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
  TooltipArrow: style({
    fill: "white",
  }),
};
