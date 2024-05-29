import {
  faInfoCircle,
  faCheckCircle,
  faCircleXmark,
  faExclamationTriangle,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import Icon from "components/Icon/Icon";

export enum Severity {
  Error = "Error",
  Success = "Success",
  Warning = "Warning",
  Info = "Info",
  Neutral = "Neutral",
}

export interface AlertProps {
  id: string;
  severity: Severity;
  content?: string;
  title: string;
  icon?: IconDefinition;
}

export function getIconBySeverity(severity: string): IconDefinition {
  switch (severity) {
    case "Error":
      return faCircleXmark;
    case "Success":
      return faCheckCircle;
    case "Warning":
      return faExclamationTriangle;
    case "Info":
    default:
      return faInfoCircle;
  }
}

const Alert = ({ severity, title, content, id, icon }: AlertProps) => {
  const defaultIcon = getIconBySeverity(severity);

  return (
    <div
      id={id}
      className={classNames(
        "flex flex-col p-1.5 text-sm rounded-lg flex-1 border-2 max-w-xl",
        {
          "bg-info-bg border-info-border": severity === "Info",
          "bg-success-bg border-success-border": severity === "Success",
          "bg-error-bg border-error-border": severity === "Error",
          "bg-warning-bg border-warning-border": severity === "Warning",
        }
      )}
    >
      <div className="flex flex-row gap-x-2 items-start">
        <Icon severity={severity} icon={icon ?? defaultIcon} />{" "}
        <p
          className={classNames("text-xs font-semibold", {
            "text-info-text": severity === "Info",
            "text-success-text": severity === "Success",
            "text-error-text": severity === "Error",
            "text-warning-text": severity === "Warning",
          })}
        >
          {title}
        </p>
      </div>
      <p className="pl-0.5 text-xs">{content}</p>
    </div>
  );
};

export default Alert;
