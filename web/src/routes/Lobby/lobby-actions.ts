import { GameMode } from "@types";

export interface LobbyActions {
  title: string;
  description: string;
  image: string;
  type: "new" | "join";
  mode?: GameMode;
}

export const ACTIONS: readonly LobbyActions[] = [
  {
    title: "Classic game",
    description: "The original Set game you love, now more fun with friends!",
    image: "/images/classic_thumb.jpg",
    type: "new",
    mode: GameMode.Classic,
  },
  {
    title: "Best of 3",
    description: "Can't agree on lunch? First to get to 3 sets decides!",
    image: "/images/bestof3_thumb.jpg",
    type: "new",
    mode: GameMode.Bestof3,
  },
  {
    title: "Join a game",
    description: "Join an ongoing game and make your mark!",
    image: "/images/join_thumb.jpg",
    type: "join",
  },
] as const;
