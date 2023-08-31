import React, { FC, PropsWithChildren, ReactNode } from "react";
import * as styles from "./Avatar.css";
import * as Popover from "@radix-ui/react-popover";
import { cx } from "../../util/cx";
import { AnimatePresence, motion } from "framer-motion";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: string;
  fallback: string;
  ping?: ReactNode;
  alt: string;
  popoverContent?: ReactNode;
}

const pingAnimationVariants = {
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

export const Avatar: FC<PropsWithChildren<AvatarProps>> = ({
  image,
  className,
  fallback,
  popoverContent,
  ...rest
}) => {
  return (
    <Popover.Root>
      <div className={cx(styles.avatar, className)} {...rest}>
        <AnimatePresence>
          {rest.ping && (
            <motion.span
              variants={pingAnimationVariants}
              animate="animate"
              exit="exit"
              initial="initial"
              className={styles.ping}
            >
              {rest.ping}
            </motion.span>
          )}
        </AnimatePresence>
        <Popover.Trigger asChild>
          <span className={styles.avatarSpan}>
            {image ? <img src={image} alt="avatar" /> : fallback}
          </span>
        </Popover.Trigger>
      </div>
      <Popover.Portal>
        {popoverContent && (
          <Popover.Content
            collisionPadding={20}
            className={styles.tooltip.content}
          >
            {popoverContent}
            <Popover.Arrow className={styles.tooltip.arrow} />
          </Popover.Content>
        )}
      </Popover.Portal>
    </Popover.Root>
  );
};
