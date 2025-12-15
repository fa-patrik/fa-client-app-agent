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
      "flex overflow-hidden flex-col w-full h-full bg-white rounded-lg border shadow-md",
      {
        "cursor-pointer": !!onClick,
      }
    )}
    onClick={onClick}
  >
    {header && (
      <div className="p-2 md:px-4 text-2xl font-bold bg-gray-200">{header}</div>
    )}
    {children}
  </div>
);
