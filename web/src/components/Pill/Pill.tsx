import { FC, PropsWithChildren, useEffect, useState } from "react";
import { Data, GameMenuAction, NotificationMessage, Player } from "src/types";
import * as styles from "./Pill.css";
import Box from "@components/Box/Box";
import { AnimatePresence, motion } from "framer-motion";
import { vars } from "@styles/index.css";
import { cx } from "../../util/cx";
import { GameMenu } from "../../menus/GameMenu";
import Button from "@components/Button/Button";
import { Hand, Sparkle } from "lucide-react";
import { AvatarGroup } from "@components/Avatar/AvatarGroup";
import { Avatar } from "@components/Avatar/Avatar";
import Loader from "@components/Loader/Loader";
import { useAppSettings } from "@services/appSettingsService";
import { WebSocketStatus } from "@store/websocket";
import BoringAvatar from "boring-avatars"

const NOTIFICATION_DURATION = 6000;

interface PillProps {
  game: Data;
  handleRequest: () => void;
  onMenuItemSelect: (action: GameMenuAction) => void;
  activeNotifications: NotificationMessage[];
  websocketStatus: WebSocketStatus;
}
const Pill: FC<PropsWithChildren<PillProps>> = ({
  game,
  handleRequest,
  onMenuItemSelect,
  activeNotifications,
  websocketStatus,
}) => {
  const { soundEnabled } = useAppSettings();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (activeNotifications.length > 0) {
      setIsExpanded(true);
      const timeoutId = setTimeout(
        () => setIsExpanded(false),
        NOTIFICATION_DURATION,
      );

      return () => clearTimeout(timeoutId);
    }
  }, [activeNotifications]);

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

  const hasRequests = game.players.some((p) => p.request);
  return (
    <motion.div
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 27,
      }}
      variants={variants}
      initial="collapsed"
      animate={isExpanded ? "expanded" : "collapsed"}
      className={cx(styles.pillWrap)}
    >
      {websocketStatus === "OPEN" ? (
        <>
          <Box orientation="row" yAlign="center" gap={vars.sizes.s6}>
            <Players players={game.players} />

            <Box
              className={styles.pillSection}
              xAlign="left"
              yAlign="left"
              gap={0}
            >
              <span>{game.remaining}</span>
              <h5>Remaning</h5>
            </Box>

            <Box
              yAlign="center"
              className={styles.pillSection}
              xAlign="left"
              orientation="row"
            >
              <Button
                dimentions="medium"
                variant="ghost"
                buttonType="pill"
                skin="dark"
                pulse={hasRequests}
                onClick={handleRequest}
              >
                Request
              </Button>
              <GameMenu
                soundEnabled={soundEnabled}
                onItemSelect={onMenuItemSelect}
              />
            </Box>
          </Box>
          {isExpanded &&
            activeNotifications.map((notification) => (
              <Box
                orientation="row"
                style={{ height: "100%", width: "100%" }}
                xAlign="center"
                yAlign="center"
                gap={0}
              >
                <AnimatePresence>
                  <motion.div
                    key={notification.timestamp.secs_since_epoch}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    style={{ position: "absolute" }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    <Box
                      orientation="row"
                      style={{ height: "100%", width: "100%" }}
                      xAlign="center"
                      yAlign="center"
                      gap={vars.sizes.s2}
                    >
                      <span>{notification.icon}</span>
                      <span style={{ ...vars.typography.m }}>
                        {notification.content}
                      </span>
                    </Box>
                  </motion.div>
                </AnimatePresence>
              </Box>
            ))}
        </>
      ) : (
        <Box
          style={{
            height: "100%",
            padding: `0 ${vars.sizes.s4}`,
            color: vars.colorVars.d11,
            ...vars.typography.m,
          }}
          orientation="row"
          yAlign="center"
        >
          <Loader theme="dark" /> Reconneting...
        </Box>
      )}
    </motion.div>
  );
};

interface AvatarProps {
  player: Player;
}

const Players: FC<PropsWithChildren<{ players: Player[] }>> = ({ players }) => {
  const topScoredPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <AvatarGroup
      visible={2}
      items={topScoredPlayers.map((tp) => ({
        image: <BoringAvatar variant="beam" size={40} name={tp?.client_id} colors={["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"]} />,
        fallback: tp.name.substring(0, 1),
        alt: `${tp.name}'s avatar`,
        popoverContent: <AvatarTooltipContent player={tp} />,
        ping: tp.score || undefined,
      }))}
    />
  );
};

const AvatarTooltipContent: FC<PropsWithChildren<AvatarProps>> = ({
  player,
}) => {
  return (
    <Box
      gap={vars.sizes.s2}
      style={{
        width: vars.sizes.s14,
        padding: vars.sizes.s2,
        background: vars.colors.background,
      }}
      xAlign="start"
      orientation="column"
    >
      <Box xAlign="start" gap={0}>
        <Avatar
          alt={`${player.name}'s avatar`}
          fallback={player.name.substring(0, 1)}
          image={<BoringAvatar variant="beam" size={40} name={player?.client_id} colors={["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"]} />}
        />
        <p style={{ fontWeight: 500 }}>{player.name}</p>
      </Box>
      <Box gap={vars.sizes.s1}>
        <Box gap={vars.sizes.s1} yAlign="center" orientation="row">
          <Sparkle style={{ width: vars.sizes.s4, height: vars.sizes.s4 }} />
          <span style={{ color: vars.colorVars.d10, ...vars.typography.m }}>
            <strong style={{ color: vars.colorVars.d12, fontWeight: 500 }}>
              {player.score}
            </strong>{" "}
            sets found
          </span>
        </Box>
        {player.request && (
          <Box gap={vars.sizes.s1} yAlign="center" orientation="row">
            <Hand size={vars.sizes.s4} />
            <span style={{ ...vars.typography.m }}>Requested cards</span>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Pill;
