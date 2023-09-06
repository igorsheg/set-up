import { FC, PropsWithChildren, Suspense, lazy } from "react";
import { Data, Player } from "src/types";
import * as styles from "./Pill.css";
import Box from "@components/Box/Box";
import { AnimatePresence, motion } from "framer-motion";
import { vars } from "@styles/index.css";
import { cx } from "../../util/cx";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { GameMenu, GameMenuAction } from "../../menus/GameMenu";
import Button from "@components/Button/Button";
import { Hand, LucideProps, Sparkle } from "lucide-react";
import { AvatarGroup } from "@components/Avatar/AvatarGroup";
import { Avatar } from "@components/Avatar/Avatar";
import Loader from "@components/Loader/Loader";
import dynamicIconImports from "lucide-react/dynamicIconImports";

interface IconProps extends LucideProps {
  name: keyof typeof dynamicIconImports;
}

const fallback = <div style={{ background: "#ddd", width: 24, height: 24 }} />;

const Icon = ({ name, ...props }: IconProps) => {
  const LucideIcon = lazy(dynamicIconImports[name]);

  return (
    <Suspense fallback={fallback}>
      <LucideIcon {...props} />
    </Suspense>
  );
};

interface PillProps {
  game: Data;
  handleRequest: () => void;
  onMenuItemSelect: (action: GameMenuAction) => void;
}
const Pill: FC<PropsWithChildren<PillProps>> = ({
  game,
  handleRequest,
  onMenuItemSelect,
}) => {
  const activeNotifications = useSelector(
    (state: RootState) => state.gameManager.activeNotifications,
  );

  const websocketState = useSelector(
    (state: RootState) => state.roomManager.webSocketStatus,
  );
  const appSettings = useSelector((state: RootState) => state.appSettings);

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
      animate={activeNotifications.length ? "expanded" : "collapsed"}
      className={cx(styles.pillWrap)}
    >
      {websocketState === "OPEN" ? (
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
                appSettings={appSettings}
                onItemSelect={onMenuItemSelect}
              />
            </Box>
          </Box>
          <AnimatePresence>
            {activeNotifications.map((notification, index) => {
              return (
                <motion.div
                  layout="position"
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ height: "100%" }}
                >
                  <Box
                    orientation="row"
                    style={{ height: "100%" }}
                    xAlign="center"
                    yAlign="center"
                    gap={vars.sizes.s2}
                  >
                    <Icon
                      name={notification.icon}
                      strokeWidth={1.5}
                      className={styles.notificationStyles.icon}
                    />
                    <span style={{ ...vars.typography.m }}>
                      {notification.content}
                    </span>
                  </Box>
                </motion.div>
              );
            })}
          </AnimatePresence>
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
          <Loader /> Reconneting...
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
      items={topScoredPlayers.map((tp) => ({
        image: `https://source.boringavatars.com/beam/40/${tp.client_id}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`,
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
          image={`https://source.boringavatars.com/beam/40/${player.name}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`}
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
