import { useState, useEffect } from "react";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { ALLOWED_HTML_ATTRIBUTES } from "api/constants";
import classNames from "classnames";
import { Severity, getIconBySeverity } from "components/Alert/Alert";
import Icon from "components/Icon/Icon";
import DOMPurify from "dompurify";

export interface BannerProps {
  id: string;
  severity: Severity;
  description?: string;
  content?: React.ReactNode;
  title?: string;
  dismissable?: boolean;
  icon?: React.ReactElement<SVGElement>;
}

const Banner = ({
  severity,
  title,
  description,
  id,
  dismissable = false,
  content,
  icon,
}: BannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const defaultIcon = getIconBySeverity(severity);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(`banner-dismissed-${id}`);
    setIsVisible(dismissed !== "true");
  }, [id]);

  const dismissBanner = () => {
    sessionStorage.setItem(`banner-dismissed-${id}`, "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      id={id}
      className={classNames("p-1 text-lg border-2 w-full", {
        "bg-info-bg border-info-border": severity === "Info",
        "bg-success-bg border-success-border": severity === "Success",
        "bg-error-bg border-error-border": severity === "Error",
        "bg-warning-bg border-warning-border": severity === "Warning",
      })}
    >
      <div className="container flex justify-between mx-auto">
        <div className="flex flex-col gap-y-1 justify-center">
          {title && (
            <div className="flex flex-row gap-1 items-center">
              <Icon
                severity={severity}
                icon={icon ?? defaultIcon}
                size="large"
              />

              <p
                className={classNames("text-sm font-semibold", {
                  "text-info-text": severity === "Info",
                  "text-success-text": severity === "Success",
                  "text-error-text": severity === "Error",
                  "text-warning-text": severity === "Warning",
                })}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(title, {
                    ALLOWED_ATTR: ALLOWED_HTML_ATTRIBUTES,
                  }),
                }}
              />
            </div>
          )}
          {description && (
            <p
              className="text-xs"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(description, {
                  ALLOWED_ATTR: ALLOWED_HTML_ATTRIBUTES,
                }),
              }}
            />
          )}
          {content}
        </div>
        <div className="flex items-center">
          {dismissable && (
            <button
              onClick={dismissBanner}
              className={classNames(
                "flex justify-center items-center w-8 h-8 hover: rounded-full transition-colors duration-200 ease-in-out",
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
    </div>
  );
};

export default Banner;
