import React, { FC, PropsWithChildren } from "react";
import * as RadixDropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuProps,
  DropdownMenuContentProps,
  DropdownMenuItemProps,
} from "@radix-ui/react-dropdown-menu";
import * as styles from "./Dropdown.css";
import Box from "@components/Box/Box";

export interface DropdownProps extends PropsWithChildren {
  menuProps?: DropdownMenuProps;
  contentProps?: DropdownMenuContentProps;
  itemProps?: DropdownMenuItemProps;
  trigger: React.ReactNode;
}

const DropdownMenu: FC<PropsWithChildren<DropdownProps>> = (props) => {
  return (
    <RadixDropdownMenu.Root {...props.menuProps}>
      <RadixDropdownMenu.Trigger>{props.trigger}</RadixDropdownMenu.Trigger>
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          className={styles.dropdownMenuContent}
          sideOffset={5}
          {...props.contentProps}
        >
          {props.children}
          <RadixDropdownMenu.Arrow className={styles.dropwdownMenuArrow} />
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
};

export interface DropdownItemProps
  extends PropsWithChildren<DropdownMenuItemProps> {
  icon?: JSX.Element;
}

export const DropdownItem = React.forwardRef<HTMLDivElement, DropdownItemProps>(
  (props, ref) => {
    return (
      <RadixDropdownMenu.Item
        ref={ref}
        {...props}
        className={styles.dropdownMenuItem}
      >
        <Box yAlign="center" gap={0} orientation="row">
          <>
            {props.icon && (
              <div className={styles.dropdownMenuItemIcon}>{props.icon}</div>
            )}
            <span>{props.children}</span>
          </>
        </Box>
      </RadixDropdownMenu.Item>
    );
  },
);

export default DropdownMenu;
