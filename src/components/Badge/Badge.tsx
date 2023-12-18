import { ReactNode } from "react";
import classNames from "classnames";

type ColorScheme = "gray" | "green" | "red" | "blue";

interface BadgeProps {
  children: ReactNode;
  colorScheme?: ColorScheme;
}

export const Badge = ({ children, colorScheme = "gray" }: BadgeProps) => (
  <div
    className={classNames(
      "py-0.5 px-1.5 bg-gray-100 rounded-md text-xs font-medium text-center border",
      {
        "bg-gray-100 border-gray-200 text-gray-900": colorScheme === "gray",
        "bg-green-100 border-green-200 text-green-800": colorScheme === "green",
        "bg-red-100 border-red-200 text-red-800": colorScheme === "red",
        "bg-primary-100 border-primary-200 text-primary-800":
          colorScheme === "blue",
      }
    )}
  >
    {children}
  </div>
);
