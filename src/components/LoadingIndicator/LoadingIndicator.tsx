import { ReactComponent as Spinner } from "assets/spinner.svg";
import classNames from "classnames";
import { Center } from "../Center/Center";

type Size = "sm" | "xs";

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
        "w-16 h-16": size !== "sm" && size !== "xs",
        "w-8 h-8": size === "sm",
        "w-4 h-4": size === "xs",
      })}
    />
  );
  return center ? <Center>{SpinnerNode}</Center> : SpinnerNode;
};
