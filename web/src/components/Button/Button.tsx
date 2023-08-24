import { RecipeVariants } from "@vanilla-extract/recipes";
import * as React from "react";
import { button, buttonPrefix } from "./Button.css";
import Box from "@components/Box/Box";

type VariantProps = RecipeVariants<typeof button>;

type ExtendedButtonProps = {
  btnPrefix?: React.ReactElement;
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps &
  ExtendedButtonProps;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      dimentions,
      variant,
      type,
      buttonType,
      skin,
      btnPrefix,
      ...rest
    },
    ref,
  ) => {
    return (
      <button
        {...rest}
        className={button({ dimentions, variant, buttonType, skin })}
        ref={ref}
      >
        <Box orientation="row" xAlign="center" yAlign="center">
          {btnPrefix && (
            <Box
              xAlign="center"
              yAlign="center"
              className={buttonPrefix({ dimentions })}
            >
              {btnPrefix}
            </Box>
          )}
          {children}
        </Box>
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
