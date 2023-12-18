import { HTMLAttributes } from "react";
import { ReactComponent as FileIcon } from "assets/minus-circle.svg";

export interface CancelIconProps extends HTMLAttributes<HTMLAnchorElement> {
  onClick?: () => void;
}

export const CancelIcon = ({ onClick }: CancelIconProps) => {
  return (
    <FileIcon
      className="w-6 h-6 text-primary-600 hover:cursor-pointer stroke-red-600"
      onClick={onClick}
    />
  );
};
