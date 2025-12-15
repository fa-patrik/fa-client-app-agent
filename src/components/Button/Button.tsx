import type {
  FunctionComponent,
  ComponentPropsWithoutRef,
  SVGProps,
} from "react";
import { ReactComponent as Spinner } from "assets/spinner.svg";
import classNames from "classnames";

export type Variant =
  | "Primary"
  | "Dark"
  | "Secondary"
  | "Red"
  | "Delete"
  | "Transparent"
  | "Success"
  | "Outlined";
type Size = "md" | "xs";

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: Variant;
  isFullWidth?: boolean;
  isLoading?: boolean;
  LeftIcon?: FunctionComponent<SVGProps<SVGSVGElement>>;
  size?: Size;
}

export const Button = ({
  children,
  variant = "Primary",
  isFullWidth = false,
  isLoading = false,
  LeftIcon,
  size = "md",
  disabled,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      type="button"
      className={classNames(
        "select-none box-border rounded-lg inline-flex items-center justify-center whitespace-nowrap align-middle",
        {
          // Base styles for each variant (non-interactive)
          "bg-primary-600 text-white fill-white":
            variant === "Primary" && !isDisabled,
          "bg-red-600 text-white fill-white": variant === "Red" && !isDisabled,
          "bg-white border-2 border-red-600 text-red-600 fill-red-600 leading-tight":
            variant === "Delete" && !isDisabled,
          "bg-white border-2 border-primary-600 text-primary-600 fill-primary-600 leading-tight":
            variant === "Secondary" && !isDisabled,
          "border-2 border-primary-600 text-primary-600 fill-primary-600 leading-tight":
            variant === "Outlined" && !isDisabled,
          "bg-gray-700 text-white fill-white":
            variant === "Dark" && !isDisabled,
          "bg-green-400 text-white": variant === "Success" && !isDisabled,

          // Interactive states (hover + cursor) - only when NOT disabled
          "cursor-pointer hover:bg-primary-800":
            variant === "Primary" && !isDisabled,
          "cursor-pointer hover:bg-red-800": variant === "Red" && !isDisabled,
          "cursor-pointer hover:bg-red-100":
            variant === "Delete" && !isDisabled,
          "cursor-pointer hover:bg-primary-100":
            (variant === "Secondary" || variant === "Outlined") && !isDisabled,
          "cursor-pointer hover:bg-gray-800": variant === "Dark" && !isDisabled,

          // Disabled states
          "bg-primary-400 text-white/70 fill-white/70 cursor-not-allowed":
            variant === "Primary" && isDisabled,
          "bg-white border-2 border-primary-300 text-primary-300 fill-primary-300 cursor-not-allowed":
            variant === "Secondary" && isDisabled,
          "bg-white border-2 border-red-300 text-red-300 fill-red-300 cursor-not-allowed":
            variant === "Delete" && isDisabled,
          "bg-red-400 text-white/70 fill-white/70 cursor-not-allowed":
            variant === "Red" && isDisabled,
          "bg-gray-500 text-white/70 fill-white/70 cursor-not-allowed":
            variant === "Dark" && isDisabled,
          "text-gray-400 cursor-not-allowed":
            variant === "Transparent" && isDisabled,
          "bg-green-300 text-white/70 cursor-not-allowed":
            variant === "Success" && isDisabled,

          // Width
          "w-full": isFullWidth,
          // Size
          "text-sm font-medium py-2.5 px-5": size === "md",
          "text-xs font-medium py-1 px-2": size === "xs",
        }
      )}
    >
      {(LeftIcon || isLoading) && (
        <span
          className={classNames("inline-flex self-center w-5 h-5 shrink-0", {
            "mr-2": children !== undefined,
          })}
        >
          {isLoading ? (
            <Spinner
              className={classNames(
                "w-5 h-5 text-primary-400 animate-spin fill-white",
                {
                  "text-primary-200 fill-primary-600": variant === "Secondary",
                }
              )}
            />
          ) : (
            LeftIcon && <LeftIcon className="w-5 h-5" aria-hidden />
          )}
        </span>
      )}
      {children}
    </button>
  );
};
