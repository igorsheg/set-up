import { vars } from "@styles/index.css";
import { style, globalStyle, keyframes } from "@vanilla-extract/css";

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
  boxShadow: `
rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px
`,
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

export const notificationStyles = {
  icon: style({
    width: vars.sizes.s4,
    height: vars.sizes.s4,
  }),
};

const pulse = keyframes({
  "0%": {
    transform: "scale(1)",
    opacity: 0,
  },
  "50%": {
    transform: "scale(1)",
    opacity: 0,
  },
  "75%": {
    transform: "scale(2.5)",
    opacity: 1,
  },
  "100%": {
    transform: "scale(3)",
    opacity: 0,
  },
});

export const requestPulse = style({
  "::before": {
    content: '""',
    position: "absolute",
    background: "rgba(40, 184, 51, 0.2)",
    left: "50%",
    marginLeft: "-3px",
    top: "50%",
    marginTop: "-3px",
    transform: "scale(2.5)",
    width: "6px",
    height: "6px",
    borderRadius: "100%",
    animation: `${pulse} 1.2s infinite cubic-bezier(0.66, 0, 0, 1)`,
  },
});
