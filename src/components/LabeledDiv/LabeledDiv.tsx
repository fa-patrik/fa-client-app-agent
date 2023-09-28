import { HTMLAttributes, ReactNode } from "react";
import classNames from "classnames";

interface LabeledDivProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  children: ReactNode;
}

export const LabeledDiv = ({
  id,
  label,
  children,
  className,
  ...rest
}: LabeledDivProps) => (
  <div
    className={classNames(className, "leading-7")}
    {...rest}
    id={`${id}-label`}
  >
    <div className="text-sm font-normal" id={`${id}-content`}>
      {label}
    </div>
    {children}
  </div>
);
