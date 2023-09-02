import Box from "@components/Box/Box";
import { cx } from "../../util/cx";
import * as styles from "./LoadingDots.css";

interface LoadingDotsProps {
  single?: boolean;
  large?: boolean;
  color?: "dark" | "white" | "accent";
  content?: string;
}

export const LoadingDots = ({
  color = "dark",
  large = false,
  single = false,
  content,
}: LoadingDotsProps) => {
  return (
    <Box gap="4px" orientation="row" yAlign="flex-end">
      {content && <div style={{ lineHeight: "17px" }}>{content}</div>}
      <div
        className={cx(styles.container, styles.colors[color], {
          [styles.single]: single,
          [styles.large]: large,
        })}
      >
        <div className={styles.dot} />
        <div className={styles.dot} />
        <div className={styles.dot} />
      </div>
    </Box>
  );
};

export default LoadingDots;
