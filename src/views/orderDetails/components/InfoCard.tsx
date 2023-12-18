import { ReactNode } from "react";
import classNames from "classnames";
import { Card } from "components";

type ColorScheme = "gray" | "green" | "red" | "blue";

interface InfoCardProps {
  label: string;
  value: ReactNode;
  colorScheme?: ColorScheme;
  onClick?: () => void;
}

export const InfoCard = ({
  label,
  value,
  colorScheme,
  onClick,
}: InfoCardProps) => (
  <Card onClick={onClick}>
    <div
      className={classNames("p-2", {
        "bg-primary-50": colorScheme === "blue",
        "bg-red-50": colorScheme === "red",
        "bg-green-50": colorScheme === "green",
      })}
    >
      <div className="text-sm font-normal">{label}</div>
      <div
        className={classNames("text-xl font-semibold", {
          "text-primary-500": colorScheme === "blue",
          "text-red-500": colorScheme === "red",
          "text-green-500": colorScheme === "green",
        })}
      >
        {value}
      </div>
    </div>
  </Card>
);
