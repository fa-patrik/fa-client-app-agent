import type { ReactNode } from "react";
import classNames from "classnames";

interface CardProps {
  children: ReactNode;
  header?: ReactNode;
  onClick?: () => void;
  id?: string;
  center?: boolean;
}

export const Card = ({ children, header, onClick, id }: CardProps) => (
  <div
    id={id}
    className={classNames(
      "flex overflow-hidden flex-col w-full h-full bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-md",
      {
        "cursor-pointer": !!onClick,
      }
    )}
    onClick={onClick}
  >
    {header && (
      <div className="p-2 md:px-4 text-2xl font-bold bg-gray-200 dark:bg-gray-700">
        {header}
      </div>
    )}
    {children}
  </div>
);
