import type { ReactNode } from "react";
import classNames from "classnames";
import { Severity } from "components/Alert/Alert";

interface BadgeProps {
  children: ReactNode;
  severity: Severity;
}

export const Badge = ({ children, severity }: BadgeProps) => (
  <div
    className={classNames(
      "py-0.5 px-1.5 rounded-md text-xs font-medium text-center border flex items-center",
      {
        "bg-gray-100 border-gray-200 text-gray-900":
          severity === Severity.Neutral,
        "bg-green-100 border-green-200 text-green-800":
          severity === Severity.Success,
        "bg-red-100 border-red-200 text-red-800": severity === Severity.Error,
        "bg-primary-100 border-primary-200 text-primary-800":
          severity === Severity.Info,
      }
    )}
  >
    {children}
  </div>
);
