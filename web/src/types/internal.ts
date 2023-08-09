import { CardSymbol, Color, Shading } from "@models/card";

export type GameSession = {
  game_over?: boolean;
  in_play: Card[][];
  last_player: string;
  last_set?: Card[];
  players: Player[];
  remaining: number;
};

export type Player = {
  id: number;
  username: string;
  request: boolean;
  score: number;
};

export type Move = {
  cards: Card[];
};

export type Card = {
  color: Color;
  number: number;
  shading: Shading;
  symbol: CardSymbol;
};
