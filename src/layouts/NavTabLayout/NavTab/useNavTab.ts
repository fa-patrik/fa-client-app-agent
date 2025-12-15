import { useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { NavTabPath } from "./types";
import type { SwipeDirection } from "../PagesCarousel/PagesCarousel";

interface useNavTabProps {
  navTabPaths: NavTabPath[];
}

export const useNavTab = ({ navTabPaths }: useNavTabProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = location.pathname.split("/").slice(-1)[0];
  const currentTabIndex = getActiveTabIndex(navTabPaths, activePath);
  const tabsRef = useRef<Element[]>([]);

  useEffect(() => {
    tabsRef.current[currentTabIndex]?.scrollIntoView({ block: "nearest" });
  }, [currentTabIndex]);

  const navigateToTab = (newIndex: number) => {
    const target = navTabPaths[newIndex]?.path;
    if (!target) return;
    const nextPath = location.pathname.replace(/[^/]+$/, target);
    if (nextPath !== location.pathname) {
      navigate(nextPath);
    }
  };

  return {
    tabsRef,
    groupProps: {
      selectedIndex: currentTabIndex,
      onChange: navigateToTab,
    },
    panelsProps: {
      currentPageIndex: currentTabIndex,
      onPageSwipe: (direction: SwipeDirection) => {
        navigateToTab(
          getCurrentTabIndexAfterSwipe(
            currentTabIndex,
            direction,
            navTabPaths.length
          )
        );
      },
    },
  };
};

const getActiveTabIndex = (
  routes: NavTabPath[],
  activePath: string | undefined
) => routes.findIndex((route) => route.path === activePath);

const getCurrentTabIndexAfterSwipe = (
  currentTabIndex: number,
  direction: SwipeDirection,
  tabsCount: number
) =>
  Math.max(
    0,
    Math.min(currentTabIndex + (direction === "left" ? 1 : -1), tabsCount - 1)
  );
