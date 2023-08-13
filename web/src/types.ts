import { COLORS, SHADINGS } from "./consts";

export type Player = {
  id: number;
  name: string;
  request: boolean;
  score: number;
};

export type Card = {
  color: number;
  shape: number;
  number: number;
  shading: number;
};

export type Data = {
  game_over?: boolean;
  in_play: Card[][];
  last_player: string;
  last_set?: Card[];
  players: Player[];
  remaining: number;
};

export type Move = {
  cards: Card[];
};

export type ColorMapping = typeof COLORS;
export type ShadingMapping = typeof SHADINGS;
export type ColorKey = keyof ColorMapping; // 0 | 1 | 2
export type ShadingKey = keyof ShadingMapping; // 0 | 1 | 2
export type ColorValue = ColorMapping[ColorKey]; // "red" | "green" | "purple"
export type ShadingValue = ShadingMapping[ShadingKey]; // "solid" | "outlined" | "striped"
