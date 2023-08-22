import React, { ReactNode } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { dialogStyles } from "./Dialog.css"; // Adjust the import path if necessary

export interface DialogProps {
  title: string;
  description: string;
  children: ReactNode;
  onSubmit?: (x: any) => void;
  onClose?: () => void;
  open?: boolean;
}

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ title, description, children, open = false }, ref) => {
    return (
      <div ref={ref}>
        <RadixDialog.Root open={open}>
          <RadixDialog.Portal container={document.getElementById("root")}>
            <RadixDialog.Overlay className={dialogStyles.overlay} />
            <RadixDialog.Content className={dialogStyles.content}>
              <RadixDialog.Title className={dialogStyles.title}>
                {title}
              </RadixDialog.Title>
              <RadixDialog.Description className={dialogStyles.description}>
                {description}
              </RadixDialog.Description>
              {children}
            </RadixDialog.Content>
          </RadixDialog.Portal>
        </RadixDialog.Root>
      </div>
    );
  },
);

export default Dialog;
export { RadixDialog };
