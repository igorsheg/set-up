import Button from "@components/Button/Button";
import DropdownMenu, {
  DropdownItem,
  DropdownProps,
} from "@components/Dropdown/Dropdown";
import { IconDots, IconLogout2, IconUsersPlus } from "@tabler/icons-react";
import { FC, PropsWithChildren } from "react";

export const GameMenu: FC<
  PropsWithChildren<Pick<DropdownProps, "itemProps">>
> = ({ itemProps }) => {
  return (
    <DropdownMenu
      trigger={
        <Button
          skin="dark"
          dimentions="small"
          variant="outline"
          buttonType="icon"
        >
          <IconDots />
        </Button>
      }
    >
      <DropdownItem icon={<IconUsersPlus />} onSelect={itemProps?.onSelect}>
        Invite players
      </DropdownItem>
      <DropdownItem icon={<IconLogout2 />} onSelect={itemProps?.onSelect}>
        Leave game
      </DropdownItem>
    </DropdownMenu>
  );
};
