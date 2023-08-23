import { RecipeVariants } from "@vanilla-extract/recipes";
import * as React from "react";
import { button } from "./Button.css";

type VariantProps = RecipeVariants<typeof button>;

const Button = React.forwardRef<
  HTMLButtonElement,
  React.HTMLProps<HTMLButtonElement> & VariantProps
>(({ children, dimentions, variant, type, buttonType, skin, ...rest }, ref) => {
  return (
    <button
      {...rest}
      className={button({ dimentions, variant, buttonType, skin })}
      ref={ref}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
