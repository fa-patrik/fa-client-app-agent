import { ReactComponent as ExclamationIcon } from "assets/exclamation-circle.svg";
import classNames from "classnames";
type Severity = "Error" | "Success" | "Warning" | "Info";

interface AlertProps {
  severity: Severity;
  content: string;
  title?: string;
  icon?: React.ReactNode;
}

/**
 * Displays guiding messages towards the user
 * depending on if diffAmount is larger, less than or equal to 0.
 * @param diffAmount amount differing from target amount.
 * @param diffPercentage percentage differing from target amount (10 => 10%).
 */
const Alert = ({ severity, icon, title, content }: AlertProps) => {
  return (
    <div
      className={classNames(
        "flex flex-col p-1 text-sm rounded-lg flex-1 gap-y-1 border",
        {
          "bg-primary-100 border-primary-200": severity === "Info",
          "bg-green-100 border-green-200": severity === "Success",
          "bg-red-100 border-red-200": severity === "Error",
          "bg-amber-100 border-amber-200": severity === "Warning",
        }
      )}
    >
      <div className="flex flex-row gap-x-1 items-end">
        {icon ??
          (severity === "Info" ? (
            <ExclamationIcon className="stroke-primary-800" />
          ) : severity === "Success" ? (
            <ExclamationIcon className="stroke-green-600" />
          ) : severity === "Error" ? (
            <ExclamationIcon className="stroke-red-800" />
          ) : (
            <ExclamationIcon className="stroke-amber-500" />
          ))}

        <span
          className={classNames("text-sm font-semibold", {
            "text-primary-800": severity === "Info",
            "text-green-600": severity === "Success",
            "text-red-800": severity === "Error",
            "text-amber-500": severity === "Warning",
          })}
        >
          {title}
        </span>
      </div>
      <p
        className={classNames("text-xs pl-1.5", {
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
