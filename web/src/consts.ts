export const COLORS: { [key: number]: string } = {
  0: "red",
  1: "purple",
  2: "green",
} as const;

export const SHAPES = {
  DIAMOND: 0,
  OVAL: 1,
  SQUIGGLE: 2,
};

export const SHADINGS: { [key: number]: string } = {
  0: "outlined",
  1: "striped",
  2: "solid",
} as const;
