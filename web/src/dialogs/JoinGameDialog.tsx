import Box from "@components/Box/Box";
import Button from "@components/Button/Button";
import Dialog, { DialogProps, RadixDialog } from "@components/Dialog/Dialog";
import { buttonStyles, dialogStyles } from "@components/Dialog/Dialog.css";
import { FC, PropsWithChildren, useRef, useState } from "react";

interface JoinGameDialogProps
  extends Pick<DialogProps, "open" | "onClose" | "dismissible"> {
  onSubmit: (room_code: string, playerUserName: string) => void;
}
export const JoinGameDialog: FC<PropsWithChildren<JoinGameDialogProps>> = (
  props,
) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formRef.current) {
      const formData = new FormData(formRef.current as HTMLFormElement);
      const room_code = formData.get("room_code") as string;
      const username = formData.get("username") as string;

      if (room_code && username) {
        props.onSubmit(room_code, username);
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
      title="Join game"
      description="Get the room code from your friend and join the game."
    >
      <form ref={formRef} onSubmit={handleSubmit} onInput={handleInput}>
        <Box orientation="row">
          <fieldset className={dialogStyles.fieldset}>
            <input
              required
              placeholder="Room code"
              className={dialogStyles.input}
              id="room_code"
              name="room_code"
            />
          </fieldset>
          <fieldset className={dialogStyles.fieldset}>
            <input
              required
              placeholder="Nickname"
              className={dialogStyles.input}
              id="username"
              name="username"
            />
          </fieldset>
        </Box>

        <Box orientation="row" xAlign="flex-end">
          <RadixDialog.Close asChild>
            <Button
              variant="ghost"
              type="button"
              className={buttonStyles.green}
              onClick={props.onClose}
            >
              Cancel
            </Button>
          </RadixDialog.Close>
          <Button
            disabled={!isFormValid}
            className={buttonStyles.green}
            type="submit"
          >
            Join Game
          </Button>
        </Box>
      </form>
    </Dialog>
  );
};
