import { style } from "@vanilla-extract/css";
import { vars } from "@styles/index.css"; // Adjust the path accordingly

export const boardGridContainer = style({
  display: "grid",
  gridTemplateRows: "repeat(auto-fill, 1fr)",
  gap: vars.spacing.s4,
});

export const row = style({
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: vars.spacing.s4,
});

export const card = style({
  border: `1px solid ${vars.colors.border}`,
  padding: vars.spacing.s4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  // fontSize: vars.typography.m, // You may need to adjust this based on your typography setup
  boxShadow: vars.shadows.md,
});

export const selected = style({
  // Define your selected card styles here, such as a border or background color
});

export const pinkCard = style({
  // styling for Pink cards
  color: vars.colors.danger,
});

export const blueCard = style({
  // styling for Blue cards
  color: vars.colors.link,
});

export const yellowCard = style({
  // styling for Yellow cards
  color: vars.colors.accent,
});

export const pink = style({ color: vars.colors.danger }); // You may choose appropriate color variables
export const blue = style({ color: vars.colors.link });
export const yellow = style({ color: vars.colors.accent });
