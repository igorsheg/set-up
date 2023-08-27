import { vars } from "@styles/index.css";
import { style, keyframes } from "@vanilla-extract/css";

const overlayShow = keyframes({
  "0%": {
    opacity: 0,
  },
  to: { opacity: 1 },
});

const contentShow = keyframes({
  "0%": {
    transform: "translate(-50%, -50%) rotate(-15deg) scale(0.8)",
    opacity: 0,
  },
  to: { transform: "translate(-50%, -50%) rotate(0deg) scale(1)", opacity: 1 },
});

export const dialogStyles = {
  overlay: style({
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    position: "fixed",
    inset: 0,
    backdropFilter: "blur(4px)",
    animation: `${overlayShow} 120ms ease`,
    zIndex: 9,
  }),
  content: style({
    zIndex: 99,
    backgroundColor: vars.colors.background,
    backgroundImage:
      "radial-gradient(ellipse 90% 90% at 80% -20%, rgba(202, 153, 213, 0.4), rgba(255, 255, 255, 0))",
    borderRadius: vars.radius,
    boxShadow: vars.shadows.xl,
    border: `1px solid ${vars.colorVars.d5}`,
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90vw",
    maxWidth: "450px",
    maxHeight: "85vh",
    padding: `${vars.sizes.s6} ${vars.sizes.s6}`,
    animation: `${contentShow} 320ms cubic-bezier(0.16, 1, 0.3, 1)`,
  }),
  title: style({
    ...vars.typography.xl,
    fontWeight: 550,
    color: vars.colorVars.d12,
  }),

  description: style({
    fontWeight: 400,
    color: vars.colorVars.d11,
  }),

  fieldset: style({
    display: "flex",
    gap: vars.sizes.s5,
    alignItems: "center",
    marginBottom: vars.sizes.s4,
    border: "none",
  }),

  label: style({
    color: vars.colorVars.d12,
    width: "90px",
    textAlign: "right",
  }),

  input: style({
    ...vars.typography.l,
    width: "100%",
    flex: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: `calc(${vars.radius} - 2px)`,
    padding: `0 ${vars.sizes.s5}`,
    color: vars.colorVars.d12,
    boxShadow: `0 0 0 1px ${vars.colorVars.d7}`,
    height: vars.sizes.s10,

    ":read-only": {
      background: vars.colorVars.d4,
    },
  }),
};

export const buttonStyles = {
  button: style({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "4px",
    padding: `0 ${vars.sizes.s2}`,
    lineHeight: 1,
    fontWeight: 500,
    height: vars.sizes.s6,
  }),
  violet: style({
    backgroundColor: vars.colors.accent,
    color: vars.colors.text,
    boxShadow: vars.shadows.sm,
    ":hover": {
      backgroundColor: vars.colorVars.d3,
    },
    ":focus": {
      boxShadow: `0 0 0 2px ${vars.colorVars.a8}`,
    },
  }),
  green: style({
    backgroundColor: vars.colors.sucess,
    color: vars.colors.text,
    ":hover": {
      backgroundColor: vars.colors.sucess,
    },
    ":focus": {
      boxShadow: `0 0 0 2px ${vars.colorVars.a7}`,
    },
  }),
  iconButton: style({
    borderRadius: "100%",
    height: vars.sizes.s4,
    width: vars.sizes.s4,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: vars.colorVars.d12,
    position: "absolute",
    padding: `${vars.sizes.s1}`,
    top: vars.sizes.s4,
    right: vars.sizes.s4,
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    cursor: "pointer",
    ":hover": {
      backgroundColor: vars.colorVars.d1,
      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    },
    ":focus": {
      boxShadow: `0 0 0 2px ${vars.colorVars.a7}`,
    },
  }),
};

export const drawerStyles = {
  overlay: style({
    position: "fixed",
    inset: 0,
    zIndex: 9,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  }),

  content: style({
    backgroundColor: vars.colors.background,
    display: "flex",
    flexDirection: "column",
    borderTopLeftRadius: vars.radius,
    borderTopRightRadius: vars.radius,
    marginTop: vars.sizes.s5,
    position: "fixed",
    bottom: 0,
    zIndex: 99,
    left: 0,
    right: 0,
    padding: `${vars.sizes.s6} ${vars.sizes.s6}`,
  }),
  grabHandle: style({
    margin: "0 auto",
    width: "48px",
    height: "6px",
    flexShrink: 0,
    borderRadius: "9999px",
    backgroundColor: vars.colors.d8,
    marginBottom: "32px",
  }),
};
