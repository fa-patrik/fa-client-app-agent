import { ForwardedRef, forwardRef, HTMLProps } from "react";
import classNames from "classnames";

export interface InputProps extends HTMLProps<HTMLInputElement> {
  label: string;
  error?: string;
}

const InputPlain = (
  { label, className, error, ...inputAttributes }: InputProps,
  ref: ForwardedRef<HTMLInputElement>
) => (
  <label
    className={classNames("text-sm font-normal", {
      "text-red-700": !!error,
    })}
  >
    {label}
    <input
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

    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </label>
);

export const Input = forwardRef(InputPlain);
