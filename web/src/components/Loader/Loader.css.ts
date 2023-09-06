import { vars } from "@styles/index.css";
import { keyframes } from "@vanilla-extract/css";
import { RecipeVariants, recipe } from "@vanilla-extract/recipes";
const spin = keyframes({
  "0%": {
    transform: "rotate(0deg)",
  },
  "100%": {
    transform: "rotate(360deg)",
  },
});

export const loaderStyles = recipe({
  base: {
    width: vars.sizes.s5,
    height: vars.sizes.s5,
    borderRadius: vars.sizes.s5,
    borderWidth: "2px",
    position: "relative",
    margin: "auto",
    animation: `${spin} 0.66s linear infinite`,
    borderStyle: "solid",
    transform: "translateZ(0px)",
    userSelect: "none",
  },

  variants: {
    theme: {
      dark: {
        borderColor: `${vars.colors.dark.d8} ${vars.colors.dark.d8} ${vars.colors.dark.d8} ${vars.colors.dark.d12}`,
      },
      light: {
        borderColor: `${vars.colors.d6} ${vars.colors.d6} ${vars.colors.d6} ${vars.colors.d12}`,
      },
    },
  },
  defaultVariants: {
    theme: "light",
  },
});

export type LoaderVariants = RecipeVariants<typeof loaderStyles>;
