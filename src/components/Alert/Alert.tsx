import { useState, useEffect } from "react";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import {
  faInfoCircle,
  faCheckCircle,
  faCircleXmark,
  faExclamationTriangle,
  faTimes,
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
  dismissible?: boolean;
  onDismiss?: () => void;
  fullWidth?: boolean;
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

const Alert = ({
  severity,
  title,
  content,
  id,
  icon,
  dismissible = false,
  onDismiss,
  fullWidth = false,
}: AlertProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const defaultIcon = getIconBySeverity(severity);

  useEffect(() => {
    if (dismissible && !onDismiss) {
      // Only use default session storage if no custom onDismiss handler
      const dismissed = sessionStorage.getItem(`alert-dismissed-${id}`);
      setIsVisible(dismissed !== "true");
    }
  }, [id, dismissible, onDismiss]);

  const dismissAlert = () => {
    if (onDismiss) {
      // Use custom dismiss handler
      onDismiss();
    } else {
      // Use default session storage
      sessionStorage.setItem(`alert-dismissed-${id}`, "true");
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      id={id}
      data-testid={`alert-${id}`}
      className={classNames(
        "flex flex-col p-1.5 text-sm rounded-lg flex-1 border-2",
        {
          "bg-info-bg border-info-border": severity === "Info",
          "bg-success-bg border-success-border": severity === "Success",
          "bg-error-bg border-error-border": severity === "Error",
          "bg-warning-bg border-warning-border": severity === "Warning",
          "max-w-xl": !fullWidth,
        }
      )}
    >
      <div className="flex flex-row gap-x-2 justify-between items-start">
        <div className="flex flex-row gap-x-2 items-start">
          <Icon severity={severity} icon={icon ?? defaultIcon} />
          <div className="flex flex-col">
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
            {content && <p className="mt-1 text-xs">{content}</p>}
          </div>
        </div>
        {dismissible && (
          <button
            onClick={dismissAlert}
            className={classNames(
              "flex justify-center items-center w-6 h-6 hover:bg-opacity-20 rounded-full transition-colors duration-200 ease-in-out ml-2",
              {
                "hover:bg-info-default-200": severity === "Info",
                "hover:bg-success-default-200": severity === "Success",
                "hover:bg-error-default-200": severity === "Error",
                "hover:bg-warning-default-200": severity === "Warning",
              }
            )}
          >
            <Icon severity={severity} icon={faTimes} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
