import { thumbButton } from "@components/ThumbButton/ThumbButton.css";
import { vars } from "@styles/index.css";
import { style, globalStyle } from "@vanilla-extract/css";

export const lobbyStyles = {
  container: style({
    zIndex: 1,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    overflow: "hidden",
    alignItems: "center",
    padding: `${vars.sizes.s12} 0`,
  }),

  header: style({
    padding: `0 ${vars.sizes.s6}`,
    width: "100%",
    textAlign: "center",
    "@media": {
      "(max-width: 768px)": {
        textAlign: "left",
      },
    },
  }),

  cardsContainer: style({
    "@media": {
      "(max-width: 768px)": {
        overflowX: "scroll",
        overflowY: "hidden",
        scrollSnapType: "x mandatory",
        overscrollBehaviorX: "contain",
        width: "100%",
        padding: `${vars.sizes.s6} ${vars.sizes.s6}`,
      },
    },
  }),
  pastRoomsContainer: style({
    zIndex: 1,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    overflow: "hidden",
    alignItems: "center",
    padding: `${vars.sizes.s3} 0`,
    "@media": {
      "(max-width: 768px)": {
        alignItems: "flex-start",
        overflowX: "scroll",
        overflowY: "hidden",
        scrollSnapType: "x mandatory",
        overscrollBehaviorX: "contain",
        width: "100%",
        padding: `${vars.sizes.s6} ${vars.sizes.s6}`,
      },
    },
  }),
};

globalStyle(`${lobbyStyles.container}  ${thumbButton.container}`, {
  width: vars.sizes.s17,
  scrollSnapAlign: "center",
  scrollSnapStop: "always",
  scrollMargin: vars.sizes.s3,
});

globalStyle(`${lobbyStyles.container} > div > h1`, {
  ...vars.typography["7xl"],
  fontWeight: 600,
  color: "transparent",
  backgroundColor: vars.colors.text,
  backgroundImage: `linear-gradient(to top, ${vars.colors.d11}, ${vars.colors.d12})`,
  backgroundClip: "text",

  "@media": {
    "(max-width: 768px)": {
      ...vars.typography["5xl"],
    },
  },
});

globalStyle(`${lobbyStyles.container} > div > p`, {
  ...vars.typography.l,
  color: vars.colors.d10,
});
