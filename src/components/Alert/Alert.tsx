import {
  faCircleInfo,
  faCircleCheck,
  faCircleExclamation,
  faTriangleExclamation,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
type Severity = "Error" | "Success" | "Warning" | "Info";

export interface AlertProps {
  id: string;
  severity: Severity;
  content?: string;
  title: string;
  icon?: IconDefinition;
}

const Icon = ({
  severity,
  icon,
}: {
  severity: string;
  icon?: IconDefinition;
}) => (
  <FontAwesomeIcon
    className={classNames("text-md", {
      "text-primary-800": severity === "Info",
      "text-green-600": severity === "Success",
      "text-red-800": severity === "Error",
      "text-amber-500": severity === "Warning",
    })}
    icon={
      icon
        ? icon
        : severity === "Info"
        ? faCircleInfo
        : severity === "Success"
        ? faCircleCheck
        : severity === "Error"
        ? faCircleExclamation
        : faTriangleExclamation
    }
  />
);

const Alert = ({ severity, icon, title, content, id }: AlertProps) => {
  return (
    <div
      id={id}
      className={classNames(
        "flex flex-col p-1.5 text-sm rounded-lg flex-1 border-2 max-w-xl",
        {
          "bg-primary-100 border-primary-200": severity === "Info",
          "bg-green-100 border-green-200": severity === "Success",
          "bg-red-100 border-red-200": severity === "Error",
          "bg-amber-100 border-amber-200": severity === "Warning",
        }
      )}
    >
      <div className="flex flex-row gap-x-2 items-start">
        {<Icon severity={severity} icon={icon} />}
        <p
          className={classNames("text-xs font-semibold", {
            "text-primary-800": severity === "Info",
            "text-green-600": severity === "Success",
            "text-red-800": severity === "Error",
            "text-amber-500": severity === "Warning",
          })}
        >
          {title}
        </p>
      </div>
      <p
        className={classNames("text-xs pl-0.5", {
          "text-primary-900": severity === "Info",
          "text-green-900": severity === "Success",
          "text-red-900": severity === "Error",
          "text-amber-900": severity === "Warning",
        })}
      >
        {content}
      </p>
    </div>
  );
};
export default Alert;
