import type { ComponentPropsWithoutRef } from "react";
import { useState } from "react";
import { ReactComponent as Spinner } from "assets/spinner.svg";
import classNames from "classnames";

import styles from "./ButtonGroup.module.css";

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  isFullWidth?: boolean;
  isLoading?: boolean;
  buttons: { label: string; onClick?: () => void }[];
  className?: string;
}

export const ButtonGroup = ({
  children,
  isLoading = false,
  buttons,
  className,
}: ButtonProps) => {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className={classNames(styles.container, className)}>
      {isLoading ? (
        <span
          className={classNames("inline-flex self-center w-5 h-5 shrink-0", {
            "mr-2": children !== undefined,
          })}
        >
          <Spinner
            className={classNames(
              "w-5 h-5 text-primary-400 animate-spin fill-white"
            )}
          />
        </span>
      ) : (
        buttons.map((button, index) => (
          <button
            key={index}
            onClick={() => {
              if (button?.onClick) {
                button?.onClick();
              }
              setActive(index);
            }}
            className={classNames(styles.button, {
              [styles.active]: active === index,
            })}
          >
            {button.label}
          </button>
        ))
      )}
    </div>
  );
};
