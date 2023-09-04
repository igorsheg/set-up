import { vars } from "@styles/index.css";
import { style } from "@vanilla-extract/css";

export const rootStyles = style({
  display: "flex",
  overflow: "hidden",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  position: "relative",
  background: vars.colors.d1,
  minHeight: "100vh",
  minWidth: "100vw",
  // "::after": {
  //   content: "",
  //   zIndex: 0,
  //   userSelect: "none",
  //   pointerEvents: "none",
  //   position: "absolute",
  //   width: "100%",
  //   height: "100%",
  //   backgroundRepeat: "repeat",
  //   opacity: 0.3,
  //   backgroundSize: "250px 250px",
  //   backgroundImage:
  //     "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
  // },
  // "::before": {
  //   content: "",
  //   position: "absolute",
  //   inset: "0",
  //   height: "100%",
  //   width: "100%",
  //   backgroundImage: `linear-gradient(to right, ${vars.colors.d4} 1px, transparent 1px),\n    linear-gradient(to bottom, ${vars.colors.d4} 1px, transparent 1px)`,
  //   backgroundSize: `${vars.sizes.s12} ${vars.sizes.s12}`,
  //   WebkitMaskImage:
  //     "radial-gradient(\n    ellipse 50% 50% at 50% 50%,\n    #000 60%,\n    transparent 100%\n  )",
  //   maskImage:
  //     "radial-gradient(\n    ellipse 50% 50% at 50% 50%,\n    #000 60%,\n    transparent 100%\n  )",
  // },
});

export const rootStylesMain = style({
  width: "100%",
  overflowY: "auto",
  overflowX: "hidden",
  justifyContent: "center",
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  height: "100%",
});
