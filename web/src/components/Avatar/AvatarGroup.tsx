import { FC, PropsWithChildren } from "react";
import * as styles from "./Avatar.css";
import { Avatar, AvatarProps } from "./Avatar";
import Box from "@components/Box/Box";
import { cx } from "../../util/cx";
import { vars } from "@styles/index.css";
import { motion } from "framer-motion";

interface AvatarGroupProps {
  items: AvatarProps[];
  visible?: number;
}

const playerAnimationVariants = {
  initial: {
    opacity: 0,
    scale: 0.5,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: { opacity: 0, scale: 0.5 },
};

export const AvatarGroup: FC<PropsWithChildren<AvatarGroupProps>> = ({
  items,
  visible = 3,
}) => {
  return (
    <motion.div
      variants={playerAnimationVariants}
      animate="animate"
      exit="exit"
      initial="initial"
      layout="position"
      className={styles.avatarGroup}
    >
      {items.slice(0, visible).map((item, index) => (
        <Avatar
          className={styles.avatarInaGroup}
          key={`${index}-avatar`}
          {...item}
        />
      ))}
      {items.length > visible && (
        <Box
          className={cx(
            styles.avatar,
            styles.avatarInaGroup,
            styles.restAvatar,
          )}
          xAlign="center"
          yAlign="center"
        >
          <span style={{ ...vars.typography.s }}>
            +{items.length - visible}
          </span>
        </Box>
      )}
    </motion.div>
  );
};
