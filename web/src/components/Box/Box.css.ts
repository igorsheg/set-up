import { vars } from "../../styles/index.css";
import { createVar, style } from "@vanilla-extract/css";
import { calc } from "@vanilla-extract/css-utils";

export const boxVars = {
  gap: createVar("gap"),
  alignItems: createVar("align-items"),
  justifyContent: createVar("justify-content"),
  flexDirection: createVar("flex-direction"),
  bleedTop: createVar("bleed-top"),
  bleedRight: createVar("bleed-right"),
  bleedBottom: createVar("bleed-bottom"),
  bleedLeft: createVar("bleed-left"),
};

export const box = style({
  display: "flex",
  vars: {
    [boxVars.gap]: vars.sizes.s2,
    [boxVars.alignItems]: "initial",
    [boxVars.justifyContent]: "initial",
    [boxVars.flexDirection]: "column",
    [boxVars.bleedTop]: "0px",
    [boxVars.bleedRight]: "0px",
    [boxVars.bleedBottom]: "0px",
    [boxVars.bleedLeft]: "0px",
  },
  boxSizing: "border-box",
  gap: boxVars.gap,
  alignItems: boxVars.alignItems,
  justifyContent: boxVars.justifyContent,
  flexDirection: boxVars.flexDirection,
  justifyItems: boxVars.justifyContent,
  marginTop: calc(boxVars.bleedTop).negate().toString(),
  marginRight: calc(boxVars.bleedRight).negate().toString(),
  marginBottom: calc(boxVars.bleedBottom).negate().toString(),
  marginLeft: calc(boxVars.bleedLeft).negate().toString(),
});
