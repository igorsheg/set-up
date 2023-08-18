import { FC, PropsWithChildren } from "react";
import { Data, Player } from "src/types";
import * as styles from "./Pill.css";
import Box from "@components/Box/Box";
import { motion } from "framer-motion";
import Tooltip from "@components/Tooltip/Tooltip";
import { vars } from "@styles/index.css";
import { IconCards, IconHandThreeFingers } from "@tabler/icons-react";
import { cx } from "../../util/cx";

interface PillProps {
  game: Data;
  handleRequest: () => void;
}
const Pill: FC<PropsWithChildren<PillProps>> = ({ game, handleRequest }) => {
  return (
    <Box
      orientation="row"
      yAlign="center"
      gap={vars.sizes.s6}
      className={styles.pillWrap}
    >
      <Players players={game.players} />

      <Box className={styles.pillSection} xAlign="left" yAlign="left" gap={0}>
        <span>{game.remaining}</span>
        <h5>Remaning</h5>
      </Box>

      <Box className={styles.pillSection} xAlign="left" yAlign="left" gap={0}>
        <button onClick={handleRequest}>Request</button>
      </Box>
    </Box>
  );
};

interface AvatarProps {
  player: Player;
}

const Players: FC<PropsWithChildren<{ players: Player[] }>> = ({ players }) => {
  return (
    <div className={styles.avatars}>
      {players.map((player: Player) => (
        <Avatar player={player} />
      ))}
    </div>
  );
};

const Avatar: FC<PropsWithChildren<AvatarProps>> = ({ player }) => {
  return (
    <motion.div
      className={cx(
        styles.avatar,
        player.request ? styles.avatarSpanRequest : "",
      )}
      layout
      key={player.name}
      initial={{
        opacity: 0,
        scale: 0.5,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      exit={{ opacity: 0, scale: 0.5 }}
    >
      <Tooltip content={<AvatarTooltipContent player={player} />}>
        <span className={styles.avatarSpan}>
          <img
            src={`https://source.boringavatars.com/beam/36/${player.name}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`}
            alt="avatar"
          />
        </span>
      </Tooltip>
    </motion.div>
  );
};

const AvatarTooltipContent: FC<PropsWithChildren<AvatarProps>> = ({
  player,
}) => {
  return (
    <Box
      gap={vars.sizes.s2}
      style={{ width: vars.sizes.s14, padding: vars.sizes.s2 }}
      xAlign="start"
      orientation="column"
    >
      <Box xAlign="start" gap={0}>
        <span className={styles.avatarSpan}>
          <img
            src={`https://source.boringavatars.com/beam/36/${player.name}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`}
            alt="avatar"
          />
        </span>
        <p style={{ fontWeight: 600 }}>{player.name}</p>
      </Box>
      <Box gap={vars.sizes.s1}>
        <Box gap={vars.sizes.s1} yAlign="center" orientation="row">
          <IconCards size={vars.sizes.s4} />
          <span style={{ color: vars.colorVars.d10, ...vars.typography.m }}>
            <strong style={{ color: vars.colorVars.d12 }}>
              {player.score}
            </strong>{" "}
            sets found
          </span>
        </Box>
        {player.request && (
          <Box gap={vars.sizes.s1} yAlign="center" orientation="row">
            <IconHandThreeFingers size={vars.sizes.s4} />
            <span style={{ ...vars.typography.m }}>Requseted cards</span>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Pill;
