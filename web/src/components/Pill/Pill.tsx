import { FC, PropsWithChildren } from "react";
import { Data, Player } from "src/types";
import * as styles from "./Pill.css";
import Box from "@components/Box/Box";
import { vars } from "@styles/index.css";

interface PillProps {
  game: Data;
}
const Pill: FC<PropsWithChildren<PillProps>> = ({ game }) => {
  console.log("game", game);
  return (
    <Box orientation="row" yAlign="center" className={styles.pillWrap}>
      <Players players={game.players} />

      <Box xAlign="left" yAlign="left" gap={0}>
        <span>Remaning cards</span>
        <span>{game.remaining}</span>
      </Box>
    </Box>
  );
};

interface AvatarProps {
  player: Player;
}

const Players: FC<PropsWithChildren<{ players: Player[] }>> = ({ players }) => {
  return (
    <Box bleedRight={-30} orientation="row">
      {players.map((player: Player) => (
        <Avatar player={player} />
      ))}
    </Box>
  );
};

const Avatar: FC<PropsWithChildren<AvatarProps>> = ({ player }) => {
  return (
    <Box bleedRight={30} className={styles.avatar}>
      <span>
        <img
          src={`https://source.boringavatars.com/beam/36/${player.name}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`}
          alt="avatar"
        />
      </span>
    </Box>
  );
};

export default Pill;
