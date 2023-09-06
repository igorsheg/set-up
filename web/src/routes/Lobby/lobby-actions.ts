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
    image:
      "https://pub-6f25fefc9b794037bc4c392ddd560812.r2.dev/classic_thumb.jpg",
    type: "new",
    mode: GameMode.Classic,
  },
  {
    title: "Best of 3",
    description: "Can't agree on lunch? First to get to 3 sets decides!",
    image:
      "https://pub-6f25fefc9b794037bc4c392ddd560812.r2.dev/bestof3_thumb.jpg",
    type: "new",
    mode: GameMode.Bestof3,
  },
  {
    title: "Join a game",
    description: "Join an ongoing game and make your mark!",
    image: "https://pub-6f25fefc9b794037bc4c392ddd560812.r2.dev/join_thumb.jpg",
    type: "join",
  },
] as const;
