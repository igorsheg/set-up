import Box from "@components/Box/Box";
import Button from "@components/Button/Button";
import Dialog, { DialogProps, RadixDialog } from "@components/Dialog/Dialog";
import { buttonStyles, dialogStyles } from "@components/Dialog/Dialog.css";
import { GameMode } from "@types";
import { FC, PropsWithChildren, useState } from "react";

interface NewGameDialogProps
  extends Pick<DialogProps, "open" | "onClose" | "onOpenChange"> {
  onSubmit: (playerUserName: string, mode: GameMode) => void;
  mode: GameMode;
}
export const NewGameDialog: FC<PropsWithChildren<NewGameDialogProps>> = (
  props,
) => {
  const [inputValue, setInputValue] = useState<string>("");

  return (
    <Dialog
      {...props}
      title="Start a new game"
      description="Set nickname and get ready to play."
    >
      <fieldset className={dialogStyles.fieldset}>
        <input
          placeholder="Nickname"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={dialogStyles.input}
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
            Cancel
          </Button>
        </RadixDialog.Close>
        <RadixDialog.Close asChild>
          <Button
            disabled={!inputValue.length}
            className={buttonStyles.green}
            onClick={() => props.onSubmit(inputValue, props.mode)}
          >
            Start Game
          </Button>
        </RadixDialog.Close>
      </Box>
    </Dialog>
  );
};
