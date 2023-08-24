import React, { ReactNode } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { dialogStyles, drawerStyles, buttonStyles } from "./Dialog.css"; // Adjust the import path if necessary
import Box from "@components/Box/Box";
import { vars } from "@styles/index.css";
import { Drawer } from "vaul";
import { useIsMobile } from "../../hooks/useIsMobile";
import { X } from "lucide-react";

export interface DialogProps extends RadixDialog.DialogProps {
  title: string;
  description: string;
  children: ReactNode;
  onClose?: () => void;
  open?: boolean;
  dismissible?: boolean;
}

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  (
    { title, description, children, open = false, onClose, dismissible },
    ref,
  ) => {
    const isMobile = useIsMobile();

    const ActiveComponent = isMobile ? Drawer : RadixDialog;
    const styles = isMobile ? drawerStyles : dialogStyles;

    return (
      <div ref={ref}>
        <ActiveComponent.Root
          dismissible={dismissible}
          onOpenChange={(open) => !open && onClose && onClose()}
          open={open}
        >
          <ActiveComponent.Portal container={document.getElementById("root")}>
            <ActiveComponent.Overlay className={styles.overlay} />
            <ActiveComponent.Content className={styles.content}>
              {isMobile && <div className={drawerStyles.grabHandle} />}
              <Box gap={vars.sizes.s5}>
                <Box gap={0}>
                  <ActiveComponent.Title className={dialogStyles.title}>
                    {title}
                  </ActiveComponent.Title>
                  <ActiveComponent.Description
                    className={dialogStyles.description}
                  >
                    {description}
                  </ActiveComponent.Description>
                </Box>
                <Box>{children}</Box>

                {!isMobile && (
                  <ActiveComponent.Close asChild>
                    <button
                      onClick={onClose}
                      className={buttonStyles.iconButton}
                      aria-label="Close"
                    >
                      <X />
                    </button>
                  </ActiveComponent.Close>
                )}
              </Box>
            </ActiveComponent.Content>
          </ActiveComponent.Portal>
        </ActiveComponent.Root>
      </div>
    );
  },
);

export default Dialog;
export { RadixDialog };
