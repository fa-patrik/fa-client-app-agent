import { ReactComponent as Spinner } from "assets/spinner.svg";
import classNames from "classnames";
import { Center } from "../Center/Center";

type Size = "sm" | "xs" | "md";

interface LoadingIndicatorProps {
  center?: boolean;
  size?: Size;
}

export const LoadingIndicator = ({
  center = false,
  size,
}: LoadingIndicatorProps) => {
  const SpinnerNode = (
    <Spinner
      className={classNames(" text-gray-200 animate-spin fill-primary-600", {
        "w-16 h-16": !size,
        "w-12 h-12": size === "md",
        "w-8 h-8": size === "sm",
        "w-4 h-4": size === "xs",
      })}
    />
  );
  return center ? <Center>{SpinnerNode}</Center> : SpinnerNode;
};
