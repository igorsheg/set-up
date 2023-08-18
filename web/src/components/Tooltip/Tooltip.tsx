import * as RadixTooltip from "@radix-ui/react-tooltip";
import * as styles from "./Tooltip.css";
import { FC, PropsWithChildren, ReactNode } from "react";

const Tooltip: FC<PropsWithChildren<{ content: ReactNode | string }>> = ({
  children,
  content,
}) => {
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root delayDuration={20}>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className={styles.tooltip.content}
            sideOffset={2}
            side="bottom"
          >
            {content}
            <RadixTooltip.Arrow className={styles.tooltip.TooltipArrow} />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export default Tooltip;
