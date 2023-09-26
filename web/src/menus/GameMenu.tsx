import Button from "@components/Button/Button";
import DropdownMenu, { DropdownItem } from "@components/Dropdown/Dropdown";
import { FC, PropsWithChildren } from "react";
import {
  LogOut,
  MoreHorizontal,
  UserPlus,
  Volume2,
  VolumeX,
} from "lucide-react";

export enum GameMenuAction {
  invite = "invite",
  leave = "leave",
  mute = "mute",
}

interface GameMenuProps {
  onItemSelect: (action: GameMenuAction) => void;
  soundEnabled?: boolean;
}

export const GameMenu: FC<PropsWithChildren<GameMenuProps>> = ({
  onItemSelect,
  soundEnabled,
}) => {
  return (
    <DropdownMenu
      trigger={
        <Button
          skin="dark"
          dimentions="medium"
          variant="ghost"
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
        icon={soundEnabled ? <VolumeX /> : <Volume2 />}
        onSelect={() => onItemSelect(GameMenuAction.mute)}
      >
        {soundEnabled ? "Disable" : "Enable"} sounds
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
