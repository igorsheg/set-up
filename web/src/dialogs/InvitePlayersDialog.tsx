import Box from "@components/Box/Box";
import Button from "@components/Button/Button";
import Dialog, { DialogProps, RadixDialog } from "@components/Dialog/Dialog";
import { buttonStyles, dialogStyles } from "@components/Dialog/Dialog.css";
import Tooltip from "@components/Tooltip/Tooltip";
import { vars } from "@styles/index.css";
import { Share } from "lucide-react";
import { FC, PropsWithChildren, useState } from "react";
import { useIsMobile } from "../hooks/useIsMobile";

interface InvitePlayersProps extends Pick<DialogProps, "open" | "onClose"> {
  roomCode: string;
  onSubmit: (playerUserName: string) => void;
}

export const InvitePlayersDialog: FC<PropsWithChildren<InvitePlayersProps>> = (
  props,
) => {
  const [gameUrlCopied, setGameUrlCopied] = useState(false);
  const [roomCodeCopied, setRoomCodeCopied] = useState(false);
  const gameUrl = new URL(window.location.href).toString();

  const isMobile = useIsMobile();

  const shareData = {
    title: "Set Up - join room",
    text: "Join a game of Set!",
    url: gameUrl,
  };

  const handleSharing = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log(`Oops! I couldn't share to the world because: ${error}`);
      }
    }
  };

  const handleCopyToClipboard = (type: "url" | "code") => {
    const action = {
      fn: type === "url" ? setGameUrlCopied : setRoomCodeCopied,
      string: type === "url" ? gameUrl : props.roomCode,
    };

    navigator.clipboard.writeText(action.string).then(
      () => {
        action.fn(true);
        setTimeout(() => {
          action.fn(false);
        }, 2000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
      },
    );
  };

  return (
    <Dialog
      {...props}
      title="Invite Players"
      description="Share the room code or url"
    >
      <Box
        style={{ marginBottom: vars.sizes.s4 }}
        orientation="row"
        xAlign="flex-end"
      >
        <Tooltip side="top" open={roomCodeCopied} content="Copied to clipboard">
          <input
            readOnly
            style={{
              letterSpacing: "0.2em",
              textAlign: "center",
            }}
            onClick={() => handleCopyToClipboard("code")}
            value={props.roomCode}
            className={dialogStyles.input}
            id="roomCode"
          />
        </Tooltip>
        <Tooltip side="top" open={gameUrlCopied} content="Copied to clipboard">
          <Button
            dimentions="large"
            variant="outline"
            onClick={() =>
              isMobile ? handleSharing() : handleCopyToClipboard("url")
            }
            btnPrefix={<Share />}
          >
            Share
          </Button>
        </Tooltip>
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
