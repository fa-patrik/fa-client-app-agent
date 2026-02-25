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
        "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100":
          severity === Severity.Neutral,
        "bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300":
          severity === Severity.Success,
        "bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300":
          severity === Severity.Error,
        "bg-primary-100 dark:bg-primary-900 border-primary-200 dark:border-primary-700 text-primary-800 dark:text-primary-300":
          severity === Severity.Info,
      }
    )}
  >
    {children}
  </div>
);
