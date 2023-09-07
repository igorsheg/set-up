import { vars } from "@styles/index.css";
import { FC } from "react";
import { thumbButton } from "./ThumbButton.css";
import Box from "@components/Box/Box";
import { ArrowUpRight } from "lucide-react";

interface ThumbButtonProps {
  title: string;
  content: string;
  image: string;
  onClick: () => void;
}

export const ThumbButton: FC<ThumbButtonProps> = ({
  onClick,
  title,
  content,
  image,
}) => {
  return (
    <a onClick={onClick} className={thumbButton.container}>
      <Box style={{ height: "100%" }} gap={vars.sizes.s2}>
        <div className={thumbButton.image}>
          <img src={image} />
        </div>
        <p className={thumbButton.title}>{title}</p>
        <Box yAlign="center" orientation="row">
          <span className={thumbButton.content}>{content}</span>
          <div className={thumbButton.icon}>
            <ArrowUpRight />
          </div>
        </Box>
      </Box>
    </a>
  );
};
