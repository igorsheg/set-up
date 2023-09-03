import Box from "@components/Box/Box";
import { cx } from "../../util/cx";
import * as styles from "./LoadingDots.css";

interface LoadingDotsProps {
  single?: boolean;
  large?: boolean;
  color?: "dark" | "white" | "accent";
  content?: string;
  size?: number;
}

export const LoadingDots = ({
  color = "dark",
  single = false,
  size = 4,
  content,
}: LoadingDotsProps) => {
  return (
    <Box gap="4px" orientation="row" yAlign="flex-end">
      {content && <div style={{ lineHeight: `${17 - size}px` }}>{content}</div>}
      <div
        className={cx(styles.container, styles.colors[color], {
          [styles.single]: single,
        })}
      >
        <div className={styles.dot} style={{ width: size, height: size }} />
        <div className={styles.dot} style={{ width: size, height: size }} />
        <div className={styles.dot} style={{ width: size, height: size }} />
      </div>
    </Box>
  );
};

export default LoadingDots;
