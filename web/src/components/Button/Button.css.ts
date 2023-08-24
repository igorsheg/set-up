import { RecipeVariants, recipe } from "@vanilla-extract/recipes";
import { vars } from "../../styles/index.css";

export const button = recipe({
  base: {
    appearance: "none",
    border: "none",
    borderRadius: vars.radius,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 550,
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",

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
        boxShadow: `inset 0 0 0 1px ${vars.colorVars.a10}, ${vars.shadows.xs}`,
        background: vars.colorVars.a9,

        ":hover": {
          backgroundColor: vars.colorVars.a10,
          boxShadow: `inset 0 0 0 1px ${vars.colorVars.a11}, ${vars.shadows.xs}`,
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
          boxShadow: `inset 0 0 0 1px ${vars.colors.d12}, ${vars.shadows.xs}`,
        },
      },
      ghost: { color: vars.colors.text, backgroundColor: "transparent" },
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
          boxShadow: `inset 0 0 0 1px ${vars.colors.d1}`,
        },
      },
    },
    {
      variants: {
        skin: "dark",
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
