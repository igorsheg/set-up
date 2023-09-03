import Box from "@components/Box/Box";
import Button from "@components/Button/Button";
import Dialog, { DialogProps, RadixDialog } from "@components/Dialog/Dialog";
import { buttonStyles, dialogStyles } from "@components/Dialog/Dialog.css";
import { GameMode } from "@types";
import { FC, PropsWithChildren, useRef, useState } from "react";

interface NewGameDialogProps
  extends Pick<DialogProps, "open" | "onClose" | "onOpenChange"> {
  onSubmit: (playerUserName: string, mode: GameMode) => void;
  mode: GameMode;
}
export const NewGameDialog: FC<PropsWithChildren<NewGameDialogProps>> = (
  props,
) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formRef.current) {
      const formData = new FormData(formRef.current as HTMLFormElement);
      const username = formData.get("username") as string;

      if (username) {
        props.onSubmit(username, props.mode);
      }
    }
  };

  const handleInput = () => {
    if (formRef.current) {
      setIsFormValid(formRef.current.checkValidity());
    }
  };

  return (
    <Dialog
      {...props}
      title="Start a new game"
      description="Set nickname and get ready to play."
    >
      <form ref={formRef} onSubmit={handleSubmit} onInput={handleInput}>
        <fieldset className={dialogStyles.fieldset}>
          <input
            placeholder="Nickname"
            required
            className={dialogStyles.input}
            id="username"
            name="username"
          />
        </fieldset>

        <Box orientation="row" xAlign="flex-end">
          <RadixDialog.Close asChild>
            <Button
              variant="outline"
              className={buttonStyles.green}
              onClick={props.onClose}
              type="button"
            >
              Cancel
            </Button>
          </RadixDialog.Close>
          <Button
            disabled={!isFormValid}
            className={buttonStyles.green}
            type="submit"
          >
            Start Game
          </Button>
        </Box>
      </form>
    </Dialog>
  );
};
