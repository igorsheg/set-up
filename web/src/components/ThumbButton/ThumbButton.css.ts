import { vars } from "@styles/index.css";
import { style } from "@vanilla-extract/css";

export const thumbButton = {
  container: style({
    height: "100%",
    flexDirection: "column",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${vars.sizes.s3} ${vars.sizes.s3}`,
    borderRadius: vars.radius.base,
    background: vars.colors.background,
    cursor: "pointer",
    boxShadow: `inset 0 0 0 2px transparent`,
    gap: vars.sizes.s3,
    border: `1px solid ${vars.colors.d6}`,
    transition: "all 420ms cubic-bezier(0.16, 1, 0.3, 1)",
    color: vars.colors.text,

    ":hover": {
      transform: "translateY(-3px)",
      transition: "all 420ms cubic-bezier(0.16, 1, 0.3, 1)",
      boxShadow: `inset 0 0 0 2px ${vars.colors.d6}`,
    },
    ":active": {},
  }),
  image: style({
    height: vars.sizes.s13,
    width: "100%",
    overflow: "hidden",
    borderRadius: vars.radius.sm,
  }),
  title: style({
    ...vars.typography.l,
    fontWeight: 500,
  }),
  content: style({
    ...vars.typography.m,
    color: vars.colors.d11,
    fontWeight: 400,
  }),
  icon: style({
    minWidth: vars.sizes.s5,
    minHeight: vars.sizes.s5,
    color: vars.colors.d12,
  }),
};
