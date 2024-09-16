import { ReactNode } from "react";
import classNames from "classnames";
import { Card } from "components";
import { Severity } from "components/Alert/Alert";

interface InfoCardProps {
  label: string;
  value: ReactNode;
  severity?: Severity;
  onClick?: () => void;
}

export const InfoCard = ({
  label,
  value,
  severity,
  onClick,
}: InfoCardProps) => (
  <Card onClick={onClick}>
    <div
      className={classNames("p-2 h-full", {
        "bg-primary-50": severity === Severity.Info,
        "bg-red-50": severity === Severity.Error,
        "bg-green-50": severity === Severity.Success,
      })}
    >
      <div className="text-sm font-normal">{label}</div>
      <div
        className={classNames("text-xl font-semibold", {
          "text-primary-500": severity === Severity.Info,
          "text-red-500": severity === Severity.Error,
          "text-green-500": severity === Severity.Success,
        })}
      >
        {value}
      </div>
    </div>
  </Card>
);
