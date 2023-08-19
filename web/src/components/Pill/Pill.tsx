import { FC, PropsWithChildren, useEffect, useState } from "react";
import { Data, Player } from "src/types";
import * as styles from "./Pill.css";
import Box from "@components/Box/Box";
import { AnimatePresence, motion } from "framer-motion";
import Tooltip from "@components/Tooltip/Tooltip";
import { vars } from "@styles/index.css";
import {
  IconCards,
  IconHandThreeFingers,
  IconPointFilled,
} from "@tabler/icons-react";
import { cx } from "../../util/cx";
import { usePrevious } from "../../hooks/usePrevious";

interface PillProps {
  game: Data;
  handleRequest: () => void;
}
const Pill: FC<PropsWithChildren<PillProps>> = ({ game, handleRequest }) => {
  const prevGameState = usePrevious(game);

  const [showNotification, setShowNotification] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");

  useEffect(() => {
    if (prevGameState && prevGameState.players) {
      const prevPlayerNames = new Set(prevGameState.players.map((p) => p.name));
      const newPlayer = game.players.find(
        (player) => !prevPlayerNames.has(player.name),
      );
      if (newPlayer) {
        setNewPlayerName(newPlayer.name);
        setShowNotification(true);
      }
    }
  }, [game.players, prevGameState]);

  useEffect(() => {
    if (showNotification) {
      const timeoutId = setTimeout(() => {
        setShowNotification(false);
      }, 6000);

      return () => clearTimeout(timeoutId);
    }
  }, [showNotification]);

  const variants = {
    collapsed: {
      height: 64,
      borderRadius: 300,
    },
    expanded: {
      height: 120,
      borderRadius: 18,
    },
  };

  return (
    <motion.div
      transition={{ type: "spring", stiffness: 200, damping: 21 }}
      variants={variants}
      initial="collapsed"
      animate={showNotification ? "expanded" : "collapsed"}
      className={cx(styles.pillWrap)}
    >
      <Box orientation="row" yAlign="center" gap={vars.sizes.s6}>
        <Players players={game.players} />

        <Box className={styles.pillSection} xAlign="left" yAlign="left" gap={0}>
          <span>{game.remaining}</span>
          <h5>Remaning</h5>
        </Box>

        <Box className={styles.pillSection} xAlign="left" yAlign="left" gap={0}>
          <button className={styles.requestButton} onClick={handleRequest}>
            Request
          </button>
        </Box>
      </Box>

      {showNotification && (
        <AnimatePresence>
          <Box
            orientation="row"
            style={{ height: "100%" }}
            xAlign="center"
            yAlign="center"
            gap={vars.sizes.s1}
          >
            <IconPointFilled style={{ color: vars.colors.danger }} />
            <span style={{ ...vars.typography.m }}>
              Player {newPlayerName} Joined the game
            </span>
          </Box>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

interface AvatarProps {
  player: Player;
}

const Players: FC<PropsWithChildren<{ players: Player[] }>> = ({ players }) => {
  const topScoredPlayers = [...players]
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return (
    <div className={styles.avatars}>
      {topScoredPlayers.map((player: Player) => (
        <Avatar player={player} />
      ))}
      {players.length - topScoredPlayers.length > 0 && (
        <Box
          className={cx(styles.avatar, styles.avatarCount)}
          xAlign="center"
          yAlign="center"
        >
          <span style={{ ...vars.typography.s }}>
            +{players.length - topScoredPlayers.length}
          </span>
        </Box>
      )}
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
