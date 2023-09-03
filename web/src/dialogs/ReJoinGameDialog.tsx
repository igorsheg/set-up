import Box from "@components/Box/Box";
import Button from "@components/Button/Button";
import Dialog, { DialogProps, RadixDialog } from "@components/Dialog/Dialog";
import { buttonStyles, dialogStyles } from "@components/Dialog/Dialog.css";
import { FC, PropsWithChildren, useRef, useState } from "react";

interface RejoinGameDialogProps
  extends Pick<DialogProps, "open" | "onClose" | "dismissible"> {
  onSubmit: (room_code: string, playerUserName: string) => void;
  room_code: string;
}
export const ReJoinGameDialog: FC<PropsWithChildren<RejoinGameDialogProps>> = (
  props,
) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formRef.current) {
      const formData = new FormData(formRef.current as HTMLFormElement);
      const username = formData.get("username") as string;

      if (props.room_code && username) {
        props.onSubmit(props.room_code, username);
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
      title="Rejoin game"
      description="Set nickname and get ready to play."
    >
      <form ref={formRef} onSubmit={handleSubmit} onInput={handleInput}>
        <fieldset className={dialogStyles.fieldset}>
          <input
            placeholder="Nickname"
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
              Back to Main Menu
            </Button>
          </RadixDialog.Close>
          <Button
            disabled={!isFormValid}
            type="submit"
            className={buttonStyles.green}
          >
            Join Game
          </Button>
        </Box>
      </form>
    </Dialog>
  );
};
