import { style } from "@vanilla-extract/css";

export const appStyles = style({
  height: "100vh",
  width: "100vw",
  display: "flex",
  overflow: "hidden",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  position: "relative",
  backgroundImage:
    "radial-gradient(ellipse 80% 80% at 50% -20%, rgba(202, 153, 213, 0.4), rgba(255, 255, 255, 0))",
  "::after": {
    content: "",
    zIndex: 0,
    userSelect: "none",
    pointerEvents: "none",
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundRepeat: "repeat",
    opacity: 0.3,
    backgroundSize: "250px 250px",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
  },
  "::before": {
    content: "",
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: -10,
    height: "100%",
    width: "100%",
    backgroundImage: `radial-gradient(rgba(120, 119, 198, 0.2) 1px, transparent 1px)`,
    backgroundSize: "16px 16px",
  },
});
