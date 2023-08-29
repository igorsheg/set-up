import Button from "@components/Button/Button";
import DropdownMenu, { DropdownItem } from "@components/Dropdown/Dropdown";
import { FC, PropsWithChildren } from "react";
import { LogOut, MoreHorizontal, UserPlus } from "lucide-react";

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
          <MoreHorizontal />
        </Button>
      }
    >
      <DropdownItem
        icon={<UserPlus />}
        onSelect={() => onItemSelect(GameMenuAction.invite)}
      >
        Invite players
      </DropdownItem>
      <DropdownItem
        icon={<LogOut />}
        onSelect={() => onItemSelect(GameMenuAction.leave)}
      >
        Leave game
      </DropdownItem>
    </DropdownMenu>
  );
};
