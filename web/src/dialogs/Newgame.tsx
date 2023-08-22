import Dialog, { DialogProps, RadixDialog } from "@components/Dialog/Dialog";
import { buttonStyles, dialogStyles } from "@components/Dialog/Dialog.css";
import { IconX } from "@tabler/icons-react";
import { FC, PropsWithChildren, useRef } from "react";

interface NewGameDialogProps extends Pick<DialogProps, "open" | "onClose"> {
  onSubmit: (playerUserName: string) => void;
}
export const NewGameDialog: FC<PropsWithChildren<NewGameDialogProps>> = (
  props,
) => {
  const fieldRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog
      {...props}
      title="Start a new game"
      description="Set nickname and get ready to play."
    >
      <fieldset className={dialogStyles.fieldset}>
        <label className={dialogStyles.label} htmlFor="username">
          Nickname
        </label>
        <input ref={fieldRef} className={dialogStyles.input} id="username" />
      </fieldset>

      <div
        style={{
          display: "flex",
          marginTop: "25px",
          justifyContent: "flex-end",
        }}
      >
        <RadixDialog.Close asChild>
          <button
            className={buttonStyles.green}
            onClick={() =>
              fieldRef.current && props.onSubmit(fieldRef.current.value)
            }
          >
            Save changes
          </button>
        </RadixDialog.Close>
      </div>
      <RadixDialog.Close asChild>
        <button
          onClick={props.onClose}
          className={buttonStyles.iconButton}
          aria-label="Close"
        >
          <IconX />
        </button>
      </RadixDialog.Close>
    </Dialog>
  );
};
