import { COLORS, SHADINGS } from "./consts";

export type Player = {
  client_id: string;
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

export enum GameMode {
  Classic = "classic",
  Bestof3 = "bestof3",
}

export type Data = {
  game_over?: boolean;
  in_play: Card[] | [];
  last_player: string | null;
  last_set: Card[] | [];
  players: Player[];
  remaining?: number;
  mode: GameMode;
  events: Event[];
};

export type Move = {
  cards: Card[];
  room_code: string;
};

export enum EventType {
  PlayerJoined = "PlayerJoined",
  PlayerLeft = "PlayerLeft",
  PlayerFoundSet = "PlayerFoundSet",
  PlayerRequestedCards = "PlayerRequestedCards",
}

export type Timestamp = {
  secs_since_epoch: number;
  nanos_since_epoch: number;
};

export type Event = {
  event_type: EventType;
  data: string;
  timestamp: Timestamp;
};

export type NotificationMessage = {
  content: string;
  icon: string;
  timestamp: Timestamp;
};

export type ColorMapping = typeof COLORS;
export type ShadingMapping = typeof SHADINGS;
export type ColorKey = keyof ColorMapping; // 0 | 1 | 2
export type ShadingKey = keyof ShadingMapping; // 0 | 1 | 2
export type ColorValue = ColorMapping[ColorKey]; // "red" | "green" | "purple"
export type ShadingValue = ShadingMapping[ShadingKey]; // "solid" | "outlined" | "striped"

export enum MessageType {
  JOIN = "join",
  MOVE = "move",
  REQUEST = "request",
  RESET = "reset",
  INIT = "init",
  CLOSE = "close",
}

interface BaseAction {
  type: MessageType;
  payload?: {
    room_code?: string;
    [key: string]: unknown;
  };
}

export interface JoinGameAction extends BaseAction {
  type: MessageType.JOIN;
  payload: {
    room_code: string;
    player_username: string;
  };
}

export interface MoveGameAction extends BaseAction {
  type: MessageType.MOVE;
  payload: {
    room_code: string;
    cards: Card[];
  };
}

export interface RequestCardsAction extends BaseAction {
  type: MessageType.REQUEST;
}

export type GameAction = JoinGameAction | MoveGameAction | RequestCardsAction;

export enum GameMenuAction {
  invite = "invite",
  leave = "leave",
  mute = "mute",
}
