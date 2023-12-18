import { ForwardedRef, forwardRef, HTMLProps, useState } from "react";
import { ReactComponent as InfoIcon } from "assets/information-circle.svg";
import classNames from "classnames";
import { ConfirmDialog } from "components/Dialog/ConfirmDialog";
import Fade from "components/Transition/Fade";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";

export interface InputProps extends HTMLProps<HTMLInputElement> {
  label: string;
  error?: string;
  tooltipContent?: string;
  id?: string;
}

const InputPlain = (
  {
    label,
    className,
    error,
    tooltipContent,
    id,
    ...inputAttributes
  }: InputProps,
  ref: ForwardedRef<HTMLInputElement>
) => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { t } = useModifiedTranslation();
  return (
    <>
      <label
        id={!id ? undefined : `${id}-label`}
        className={classNames("text-sm font-normal", {
          "text-red-700": !!error,
        })}
      >
        <div className="flex gap-x-1 items-center">
          {label}
          {tooltipContent && (
            <>
              <div
                id={!id ? undefined : `${id}-tooltipDialogButton`}
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
        <input
          id={id}
          ref={ref}
          className={classNames(
            "block p-2 w-full text-sm  bg-gray-50  border border-gray-300 focus:border-primary-400",
            className,
            {
              "text-red-900 placeholder-red-700 bg-red-50 focus:border-red-500 border-red-500 rounded-lg":
                !!error,
              "cursor-not-allowed": inputAttributes.disabled,
              "text-green-400 w-5 h-5 rounded-full":
                inputAttributes.type === "checkbox",
              "text-black rounded-lg": inputAttributes.type !== "checkbox",
            }
          )}
          {...inputAttributes}
        />

        <Fade>
          {error && (
            <p
              id={!id ? undefined : `${id}-error`}
              className="mt-1 text-xs text-red-600"
            >
              {error}
            </p>
          )}
        </Fade>
      </label>
      {tooltipContent && (
        <ConfirmDialog
          id={!id ? undefined : `${id}-tooltipDialog`}
          title={t("component.select.dialogTitle")}
          description={tooltipContent}
          cancelButtonText={t("component.select.dialogCloseButtonLabel")}
          isOpen={confirmDialogOpen}
          setIsOpen={setConfirmDialogOpen}
        />
      )}
    </>
  );
};

export const Input = forwardRef(InputPlain);
