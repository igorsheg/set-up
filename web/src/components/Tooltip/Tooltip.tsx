import * as RadixTooltip from "@radix-ui/react-tooltip";
import * as styles from "./Tooltip.css";
import { FC, PropsWithChildren, ReactNode } from "react";

const Tooltip: FC<
  PropsWithChildren<
    ({ content: ReactNode | string } & Pick<
      RadixTooltip.TooltipProps,
      "open"
    >) &
    Pick<RadixTooltip.TooltipContentProps, "side">
  >
> = ({ children, content, ...toolTipProps }) => {
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root open={toolTipProps.open} delayDuration={20}>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className={styles.tooltip.content}
            collisionPadding={20}
            sideOffset={2}
            side={toolTipProps.side || "bottom"}
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
