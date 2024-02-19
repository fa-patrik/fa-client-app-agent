import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";

export type Size = "small" | "medium" | "large";

const Icon = ({
  severity,
  icon,
  size = "medium", // default size is 'medium'
}: {
  severity: string;
  icon: IconDefinition;
  size?: Size; // size is now an optional prop
}) => (
  <FontAwesomeIcon
    className={classNames({
      "text-xs": size === "small",
      "text-md": size === "medium",
      "text-xl": size === "large",
      "text-primary-800": severity === "Info",
      "text-green-600": severity === "Success",
      "text-red-800": severity === "Error",
      "text-amber-500": severity === "Warning",
    })}
    icon={icon}
  />
);

export default Icon;
