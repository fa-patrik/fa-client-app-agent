import type { ReactNode } from "react";
import { Children } from "react";
import { useSwipeable } from "react-swipeable";

export type SwipeDirection = "left" | "right";

export interface PagesCarouselProps {
  children: ReactNode;
  currentPageIndex: number;
  onPageSwipe: (direction: SwipeDirection) => void;
}

export const PagesCarousel = ({
  children,
  currentPageIndex,
  onPageSwipe,
}: PagesCarouselProps) => {
  const handlers = useSwipeable({
    onSwipedLeft: () => onPageSwipe("left"),
    onSwipedRight: () => onPageSwipe("right"),
    delta: 50,
  });

  return (
    <div className="overflow-auto flex-1 w-full" {...handlers}>
      <div className="flex h-full">
        {Children.map(children, (child, index) => {
          const isCurrent = index === currentPageIndex;
          return (
            <div
              key={index}
              className={`transition-all overflow-x-hidden ${
                isCurrent ? "w-full" : "w-0 h-0"
              }`}
            >
              <div className="w-full">{isCurrent && child}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
