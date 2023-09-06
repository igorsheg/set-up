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
import { RootState } from "@store/index";

export enum GameMenuAction {
  invite = "invite",
  leave = "leave",
  mute = "mute",
}

interface GameMenuProps {
  onItemSelect: (action: GameMenuAction) => void;
  appSettings?: RootState["appSettings"];
}

export const GameMenu: FC<PropsWithChildren<GameMenuProps>> = ({
  onItemSelect,
  appSettings,
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
        icon={appSettings?.soundEnabled ? <VolumeX /> : <Volume2 />}
        onSelect={() => onItemSelect(GameMenuAction.mute)}
      >
        {appSettings?.soundEnabled ? "Disable" : "Enable"} sounds
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
