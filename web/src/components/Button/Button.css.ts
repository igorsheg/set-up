import { RecipeVariants, recipe } from "@vanilla-extract/recipes";
import { vars } from "../../styles/index.css";
import { keyframes } from "@vanilla-extract/css";

const pulseLight = keyframes({
  "0%": {
    boxShadow: `0 0 0 0 rgba(255,255,255, 1)`,
    opacity: 0,
  },
  "50%": {
    boxShadow: `0 0 0 0 rgba(255,255,255, 0.7)`,
    opacity: 0,
  },
  "75%": {
    boxShadow: `0 0 0 8px rgba(255,255,255, 0)`,
    opacity: 1,
  },
  "100%": {
    boxShadow: "0 0 0 16px rgba(255,255,255, 0)",
    opacity: 0,
  },
});

const pulseDark = keyframes({
  "0%": {
    boxShadow: `0 0 0 0 rgba(0,0,0, 0.7)`,
    opacity: 0,
  },
  "50%": {
    boxShadow: `0 0 0 0 rgba(0,0,0, 0.7)`,
    opacity: 0,
  },
  "75%": {
    boxShadow: `0 0 0 6px rgba(0,0,0, 0)`,
    opacity: 1,
  },
  "100%": {
    boxShadow: "0 0 0 8px rgba(0,0,0, 0)",
    opacity: 0,
  },
});

export const button = recipe({
  base: {
    appearance: "none",
    border: "none",
    borderRadius: vars.radius.sm,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 500,
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    willChange: "box-shadow, transform, background-color",

    ":hover": {
      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      cursor: "pointer",
    },
    ":active": {
      transform: "translateY(1px)",
      boxShadow: "none",
    },
  },
  variants: {
    pulse: {
      true: {
        "::before": {
          content: '""',
          position: "absolute",
          width: "100%",
          height: "100%",
          borderRadius: vars.radius.sm,
          animation: `${pulseDark} 3.2s infinite cubic-bezier(0.66, 0, 0, 1)`,
        },
      },
    },
    skin: {
      light: {},
      dark: {},
    },
    buttonType: {
      button: {},
      icon: {
        borderRadius: "50%",
      },
      pill: {
        borderRadius: vars.sizes.s13,
      },
    },
    variant: {
      primary: {
        color: vars.colorVars.d1,
        boxShadow: `inset 0 1px 0 -1px ${vars.colorVars.a8}, ${vars.shadows.xs}`,
        background: vars.colorVars.a9,

        ":hover": {
          backgroundColor: vars.colorVars.a8,
          boxShadow: `inset 0 1px 0 -1px ${vars.colorVars.a7}, ${vars.shadows.xs}`,
        },

        ":disabled": {
          backgroundColor: vars.colorVars.d6,
          pointerEvents: "none",
          cursor: "auto",
          boxShadow: "none",
        },
      },
      outline: {
        color: vars.colorVars.d12,
        backgroundColor: "transparent",
        boxShadow: `inset 0 0 0 1px ${vars.colors.d8}, ${vars.shadows.xs}`,

        ":hover": {
          backgroundColor: vars.colorVars.d8,
          boxShadow: `inset 0 0 0 1px ${vars.colors.d8}, ${vars.shadows.xs}`,
        },
      },
      ghost: {
        color: vars.colorVars.d12,
        backgroundColor: vars.colorVars.d4,

        ":hover": {
          backgroundColor: vars.colorVars.d7,
        },
      },
    },
    dimentions: {
      small: {
        ...vars.typography.m,
        height: vars.sizes.s7,
        padding: `0 ${vars.sizes.s4}`,
      },
      medium: {
        ...vars.typography.m,
        height: vars.sizes.s8,
        padding: `0 ${vars.sizes.s5}`,
      },
      large: {
        height: vars.sizes.s10,
        padding: `0 ${vars.sizes.s6}`,
      },
      xl: {
        height: vars.sizes.s11,
        padding: `0 ${vars.sizes.s7}`,
      },
    },
  },

  compoundVariants: [
    {
      variants: {
        buttonType: "pill",
        pulse: true,
        skin: "dark",
      },
      style: {
        "::before": {
          content: '""',
          position: "absolute",
          width: "100%",
          height: "100%",
          borderRadius: vars.sizes.s13,
          animation: `${pulseLight} 3.2s infinite cubic-bezier(0.66, 0, 0, 1)`,
        },
      },
    },
    {
      variants: {
        buttonType: "icon",
        dimentions: "small",
      },
      style: {
        width: vars.sizes.s7,
        height: vars.sizes.s7,
        padding: 0,
      },
    },
    {
      variants: {
        buttonType: "icon",
        dimentions: "medium",
      },
      style: {
        width: vars.sizes.s8,
        height: vars.sizes.s8,
        padding: 0,
      },
    },
    {
      variants: {
        buttonType: "icon",
        dimentions: "large",
      },
      style: {
        padding: vars.sizes.s4,
      },
    },
    {
      variants: {
        buttonType: "icon",
        dimentions: "xl",
      },
      style: {
        padding: vars.sizes.s5,
      },
    },
    {
      variants: {
        skin: "dark",
        variant: "outline",
      },
      style: {
        color: vars.colors.background,
        boxShadow: `inset 0 0 0 1px ${vars.colors.d11}`,
        ":hover": {
          background: "transparent",
          boxShadow: `inset 0 0 0 1px ${vars.colors.d1}`,
        },
      },
    },
    {
      variants: {
        skin: "dark",
        variant: "ghost",
      },
      style: {
        color: vars.colors.background,
        backgroundColor: vars.colors.dark.d5,
        ":hover": {
          background: "transparent",
          backgroundColor: vars.colors.dark.d7,
        },
      },
    },
    {
      variants: {
        skin: "dark",
        variant: "ghost",
        buttonType: "icon",
      },
      style: {
        color: vars.colors.background,
        backgroundColor: vars.colors.dark.d5,
        ":hover": {
          background: "transparent",
          backgroundColor: vars.colors.dark.d7,
        },
      },
    },
    {
      variants: {
        skin: "dark",
        variant: "outline",
        buttonType: "icon",
      },
      style: {
        color: vars.colors.background,
        boxShadow: `inset 0 0 0 1px ${vars.colors.d11}`,

        ":hover": {
          boxShadow: `inset 0 0 0 1px ${vars.colors.d1}`,
        },
      },
    },
  ],

  defaultVariants: {
    variant: "primary",
    dimentions: "medium",
    buttonType: "button",
    skin: "light",
  },
});

export const buttonPrefix = recipe({
  base: {},
  variants: {
    dimentions: {
      small: {
        height: vars.sizes.s4,
      },
      medium: {
        height: vars.sizes.s5,
        width: vars.sizes.s5,
      },
      large: {
        height: vars.sizes.s5,
        width: vars.sizes.s5,
      },
      xl: {
        height: vars.sizes.s5,
      },
    },
  },
  defaultVariants: {
    dimentions: "medium",
  },
});

export type ButtonVariants = RecipeVariants<typeof button>;
