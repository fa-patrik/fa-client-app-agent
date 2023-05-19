import { HTMLAttributes, ReactNode } from "react";
import classNames from "classnames";
import { useInView } from "react-intersection-observer";

/**
 * Props for the DelayRenderingTillVisible component.
 */
interface DelayRenderingTillVisibleProps {
  /** The child nodes of the component. */
  children: ReactNode;
  /**
   * If true, the component won't be replaced back to a placeholder once out of view.
   * @default true
   */
  triggerOnce?: boolean;
  /**
   * Class names to extend the placeholder's styling.
   * @default "h-11"
   */
  placeholderClassName?: HTMLAttributes<HTMLDivElement>["className"];
}

/**
 * Component that delays rendering of its children until they are visible in the viewport.
 */
export const DelayRenderingTillVisible = ({
  children,
  triggerOnce = true,
  placeholderClassName = "h-11",
}: DelayRenderingTillVisibleProps) => {
  const { ref, inView } = useInView({
    triggerOnce,
    rootMargin: "200px 0px",
  }) as unknown as { ref: React.RefObject<HTMLDivElement>; inView: boolean };

  return (
    <>
      {!inView ? (
        <div
          ref={ref}
          className={classNames("col-span-full", placeholderClassName)}
        ></div>
      ) : (
        children
      )}
    </>
  );
};
