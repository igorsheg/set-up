import Box from "@components/Box/Box";
import Button from "@components/Button/Button";
import Dialog, { DialogProps, RadixDialog } from "@components/Dialog/Dialog";
import { buttonStyles, dialogStyles } from "@components/Dialog/Dialog.css";
import { FC, PropsWithChildren, useState } from "react";

interface RoomJoinGameDialogProps
  extends Pick<DialogProps, "open" | "onClose" | "dismissible"> {
  onSubmit: (room_code: string, playerUserName: string) => void;
  room_code: string;
}
export const RoomJoinGameDialog: FC<
  PropsWithChildren<RoomJoinGameDialogProps>
> = (props) => {
  const [inputValue, setInputValue] = useState<string>("");
  return (
    <Dialog
      {...props}
      title="Rejoin game"
      description="Set nickname and get ready to play."
    >
      <fieldset className={dialogStyles.fieldset}>
        <input
          placeholder="Nickname"
          className={dialogStyles.input}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          id="username"
        />
      </fieldset>

      <Box orientation="row" xAlign="flex-end">
        <RadixDialog.Close asChild>
          <Button
            variant="outline"
            className={buttonStyles.green}
            onClick={props.onClose}
          >
            Back to Main Menu
          </Button>
        </RadixDialog.Close>
        <RadixDialog.Close asChild>
          <Button
            disabled={!inputValue.length}
            className={buttonStyles.green}
            onClick={() => props.onSubmit(props.room_code, inputValue)}
          >
            Join Game
          </Button>
        </RadixDialog.Close>
      </Box>
    </Dialog>
  );
};
