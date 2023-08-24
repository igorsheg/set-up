import Button from "@components/Button/Button";
import DropdownMenu, { DropdownItem } from "@components/Dropdown/Dropdown";
import { IconDots, IconLogout2, IconUsersPlus } from "@tabler/icons-react";
import { FC, PropsWithChildren } from "react";

export enum GameMenuAction {
  invite = "invite",
  leave = "leave",
}

interface GameMenuProps {
  onItemSelect: (action: GameMenuAction) => void;
}

export const GameMenu: FC<PropsWithChildren<GameMenuProps>> = ({
  onItemSelect,
}) => {
  return (
    <DropdownMenu
      trigger={
        <Button
          skin="dark"
          dimentions="medium"
          variant="outline"
          buttonType="icon"
        >
          <IconDots />
        </Button>
      }
    >
      <DropdownItem
        icon={<IconUsersPlus />}
        onSelect={() => onItemSelect(GameMenuAction.invite)}
      >
        Invite players
      </DropdownItem>
      <DropdownItem
        icon={<IconLogout2 />}
        onSelect={() => onItemSelect(GameMenuAction.leave)}
      >
        Leave game
      </DropdownItem>
    </DropdownMenu>
  );
};
