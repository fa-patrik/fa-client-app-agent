import type { HTMLAttributes, ReactNode } from "react";
import { Children, cloneElement, isValidElement } from "react";

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  firstChildClassName?: string;
  lastChildClassName?: string;
  middleChildClassName?: string;
}

export const Grid = ({
  children,
  className,
  firstChildClassName = "",
  lastChildClassName = "",
  middleChildClassName = "",
  ...rest
}: GridProps) => {
  const ChildrenArray = Children.toArray(children);
  return (
    <>
      {ChildrenArray.map((child, index) => {
        if (isValidElement<{ className?: string }>(child)) {
          return cloneElement(child, {
            ...rest,
            className: `${child.props.className ?? ""} ${className} ${
              index === 0 ? firstChildClassName : ""
            } ${index === ChildrenArray.length - 1 ? lastChildClassName : ""} ${
              index !== 0 && index !== ChildrenArray.length - 1
                ? middleChildClassName
                : ""
            }
            `,
          } as Partial<unknown>);
        }
        return child;
      })}
    </>
  );
};

interface GridHeaderProps {
  children: ReactNode;
}

const GridHeader = ({ children }: GridHeaderProps) => (
  <Grid
    className="py-1 text-sm font-semibold text-gray-500 bg-gray-100"
    firstChildClassName="pl-2 text-left"
    middleChildClassName="text-right "
    lastChildClassName="text-right pr-2"
  >
    {children}
  </Grid>
);
Grid.Header = GridHeader;

const GridRow = ({ children, onClick, className, ...rest }: GridProps) => (
  <Grid
    firstChildClassName="ml-2 text-left"
    middleChildClassName="text-right pl-2"
    lastChildClassName="text-right mr-2"
    onClick={onClick}
    className={
      (className ? className : "") + (onClick ? " cursor-pointer" : "")
    }
    {...rest}
  >
    {children}
  </Grid>
);
Grid.Row = GridRow;
