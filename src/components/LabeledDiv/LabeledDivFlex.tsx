import { HTMLAttributes, ReactNode, useState } from "react";
import { ReactComponent as InfoIcon } from "assets/information-circle.svg";
import classNames from "classnames";
import { ConfirmDialog } from "components/Dialog/ConfirmDialog";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";

type Position = "left" | "right" | "center";

interface LabeledDivFlexProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  children: ReactNode;
  tooltipContent?: string;
  alignText?: Position;
  error?: string;
}

/**
 * Compared to LabeledDiv, this offers the posibility to add a tooltip and
 * place all text either left, right, center on the x-axis.
 */
export const LabeledDivFlex = ({
  id,
  label,
  children,
  tooltipContent,
  className,
  alignText,
  error,
  ...rest
}: LabeledDivFlexProps) => {
  const { t } = useModifiedTranslation();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  return (
    <div
      {...rest}
      className={classNames("flex flex-col", {
        "items-center": alignText === "center",
        "items-start": alignText === "left",
        "items-end": alignText === "right",
      })}
    >
      <div className="flex flex-row gap-x-1">
        <div className="text-sm font-normal" id={`${id}-label`}>
          {label}
        </div>
        {tooltipContent && (
          <>
            <div
              id={`${id}-toolTipDialogButton`}
              className="cursor-help"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDialogOpen(true);
              }}
            >
              <InfoIcon />
            </div>
          </>
        )}
      </div>
      <span id={`${id}-content`} className={classNames(className, {})}>
        {children}
      </span>
      {tooltipContent && (
        <ConfirmDialog
          title={t("component.select.dialogTitle")}
          description={tooltipContent}
          cancelButtonText={t("component.select.dialogCloseButtonLabel")}
          isOpen={confirmDialogOpen}
          setIsOpen={setConfirmDialogOpen}
        />
      )}
      {error && (
        <span className="text-xs text-red-500" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
};
