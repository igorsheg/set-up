import React, { ReactNode } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { dialogStyles, buttonStyles } from "./Dialog.css"; // Adjust the import path if necessary
import { IconX } from "@tabler/icons-react";
import Box from "@components/Box/Box";
import { vars } from "@styles/index.css";

export interface DialogProps {
  title: string;
  description: string;
  children: ReactNode;
  onClose?: () => void;
  open?: boolean;
}

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ title, description, children, open = false, onClose }, ref) => {
    return (
      <div ref={ref}>
        <RadixDialog.Root open={open}>
          <RadixDialog.Portal container={document.getElementById("root")}>
            <RadixDialog.Overlay className={dialogStyles.overlay} />
            <RadixDialog.Content className={dialogStyles.content}>
              <Box gap={vars.sizes.s5}>
                <Box gap={0}>
                  <RadixDialog.Title className={dialogStyles.title}>
                    {title}
                  </RadixDialog.Title>
                  <RadixDialog.Description className={dialogStyles.description}>
                    {description}
                  </RadixDialog.Description>
                </Box>
                <Box>{children}</Box>

                <RadixDialog.Close asChild>
                  <button
                    onClick={onClose}
                    className={buttonStyles.iconButton}
                    aria-label="Close"
                  >
                    <IconX />
                  </button>
                </RadixDialog.Close>
              </Box>
            </RadixDialog.Content>
          </RadixDialog.Portal>
        </RadixDialog.Root>
      </div>
    );
  },
);

export default Dialog;
export { RadixDialog };
