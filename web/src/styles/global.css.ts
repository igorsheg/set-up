import { globalStyle, globalFontFace } from "@vanilla-extract/css";
import { vars } from "./index.css";

/*
  Josh's Custom CSS Reset
  https://www.joshwcomeau.com/css/custom-css-reset/
*/

const generalSans = "ClashGrotesk";

globalFontFace(generalSans, {
  src: "url('/fonts/GeneralSans-Variable.woff2') format('woff2')",
});

globalStyle("*, *:before, *:after", {
  boxSizing: "border-box",
});

globalStyle("*", {
  margin: 0,
});

globalStyle("html, body", {
  height: "100%",
  margin: 0,
  padding: 0,
  fontFamily: generalSans,
});

globalStyle("body", {
  lineHeight: 1.5,
  fontWeight: 450,
  WebkitFontSmoothing: "grayscale",
  background: vars.colors.background,
  color: vars.colors.text,
});

globalStyle("img, picture, video, canvas, svg", {
  display: "block",
  maxWidth: "100%",
});

globalStyle("input, button, textarea, select", {
  font: "inherit",
});

globalStyle("p, h1, h2, h3, h4, h5, h6", {
  overflowWrap: "break-word",
});

globalStyle("#root, #__next", {
  isolation: "isolate",
});

globalStyle("a", {
  color: vars.colors.link,
  textDecoration: "none",
});

globalStyle("article p", {
  color: vars.colors.text,
  lineHeight: 1.6,
  marginBottom: vars.sizes.s1,
  fontSize: 17,
});

globalStyle("button", {
  background: "none",
  color: "inherit",
  border: "none",
  padding: "0",
  font: "inherit",
  cursor: "pointer",
  outline: "inherit",
  WebkitAppearance: "none",
  MozAppearance: "none",
  appearance: "none",
  textAlign: "inherit",
  display: "inline-block",
  margin: "0",
  verticalAlign: "baseline",
});

globalStyle("button, fieldset, input", {
  all: "unset",
});

globalStyle("button:focus-visible", {
  boxShadow: `0 0 0 1px ${vars.colorVars.a9}, 0 0 0 4px ${vars.colorVars.a5}`,
});
globalStyle("input:focus-visible", {
  boxShadow: `0 0 0 1px ${vars.colorVars.a9}, 0 0 0 4px ${vars.colorVars.a5}`,
});
