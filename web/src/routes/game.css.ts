import { style } from "@vanilla-extract/css";

export const gamePageStyles = style({
  height: "100vh",
  width: "100vw",
  display: "flex",
  overflow: "hidden",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  position: "relative",
  backgroundImage:
    "radial-gradient(100% 89.5% at 100% 0%, rgb(236, 224, 255) 0%, rgba(242, 229, 255, 0) 100%)",
  "::before": {
    content: "",
    zIndex: 0,
    userSelect: "none",
    pointerEvents: "none",
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundRepeat: "repeat",
    opacity: 0.4,
    backgroundSize: "250px 250px",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
  },
});
