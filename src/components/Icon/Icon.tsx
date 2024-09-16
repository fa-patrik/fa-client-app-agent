import React from "react";
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
  icon: IconDefinition | React.ReactElement<SVGElement>; // icon can now be a FontAwesomeIcon or an svg element
  size?: Size; // size is now an optional prop
}) => {
  // Check if icon is a FontAwesomeIcon
  const isFontAwesomeIcon = (icon: unknown): icon is IconDefinition => {
    return (icon as IconDefinition).iconName !== undefined;
  };

  return (
    <div
      className={classNames({
        "text-xs": size === "small",
        "text-sm": size === "medium",
        "text-xl": size === "large",
        "text-primary-800": severity === "Info",
        "text-green-600": severity === "Success",
        "text-red-800": severity === "Error",
        "text-amber-500": severity === "Warning",
      })}
    >
      {isFontAwesomeIcon(icon) ? <FontAwesomeIcon icon={icon} /> : icon}
    </div>
  );
};

export default Icon;
