import type { ReactNode } from "react";
import classNames from "classnames";

interface GainLoseColoringProps {
  children: ReactNode;
  value?: number;
}

export const GainLoseColoring = ({
  children,
  value,
}: GainLoseColoringProps) => (
  <div
    className={classNames({
      "text-red-500": value !== undefined && value < 0,
      "text-green-400": value !== undefined && value > 0,
    })}
  >
    {children}
  </div>
);
