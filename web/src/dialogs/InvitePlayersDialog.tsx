import Box from "@components/Box/Box";
import Button from "@components/Button/Button";
import Dialog, { DialogProps, RadixDialog } from "@components/Dialog/Dialog";
import { buttonStyles, dialogStyles } from "@components/Dialog/Dialog.css";
import { Share } from "lucide-react";
import { FC, PropsWithChildren } from "react";

interface InvitePlayersProps extends Pick<DialogProps, "open" | "onClose"> {
  roomCode: string;
  onSubmit: (playerUserName: string) => void;
}
export const InvitePlayersDialog: FC<PropsWithChildren<InvitePlayersProps>> = (
  props,
) => {
  const shareData = {
    title: "Set Up - join room",
    text: "Join a game of Set!",
    url: "https://developer.mozilla.org",
  };
  const handleSharing = async () => {
    if (navigator.share) {
      try {
        await navigator
          .share(shareData)
          .then(() =>
            console.log("Hooray! Your content was shared to tha world"),
          );
      } catch (error) {
        console.log(`Oops! I couldn't share to the world because: ${error}`);
      }
    } else {
      // fallback code
      console.log(
        "Web share is currently not supported on this browser. Please provide a callback",
      );
    }
  };
  return (
    <Dialog
      {...props}
      title="Invite Players"
      description="Share the room code or share the rooms url"
    >
      <Box orientation="row" xAlign="flex-end">
        <fieldset className={dialogStyles.fieldset}>
          <input
            readOnly
            value={props.roomCode}
            className={dialogStyles.input}
            id="roomCode"
          />
        </fieldset>
        <Button
          dimentions="large"
          variant="outline"
          onClick={handleSharing}
          btnPrefix={<Share />}
        >
          Share
        </Button>
      </Box>

      <Box orientation="row" xAlign="flex-end">
        <RadixDialog.Close asChild>
          <Button className={buttonStyles.green} onClick={props.onClose}>
            Done
          </Button>
        </RadixDialog.Close>
      </Box>
    </Dialog>
  );
};
