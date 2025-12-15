import { Suspense } from "react";
import { LoadingIndicator } from "components";
import { useFilteredTabRoutes } from "hooks/useFilteredTabRoutes";
import { Outlet } from "react-router-dom";
import { NavTab } from "./NavTab/NavTab";
import type { NavTabPath } from "./NavTab/types";
import { useNavTab } from "./NavTab/useNavTab";
import { useRedirectIfInvalidTab } from "./useRedirectIfInvalidTab";

interface NavTabTemplateLayoutProps {
  routes: NavTabPath[];
}

export const NavTabLayout = ({ routes }: NavTabTemplateLayoutProps) => {
  // Filter tabs for display only (not routing)
  const { filteredRoutes: visibleTabRoutes } = useFilteredTabRoutes(routes);

  // Redirect to overview if current URL doesn't match any visible tab
  useRedirectIfInvalidTab(visibleTabRoutes);

  const { tabsRef, groupProps, panelsProps } = useNavTab({
    navTabPaths: visibleTabRoutes, // Use filtered routes in order to hide tabs that are not available
  });

  return (
    <div className="flex overflow-auto flex-col">
      <NavTab.Group {...groupProps}>
        <NavTab.List>
          {visibleTabRoutes.map((route, index) => (
            <NavTab.NavTab
              key={`NavTab_${index}`}
              ref={(el: HTMLButtonElement) => {
                tabsRef.current[index] = el;
              }}
            >
              {route.tabLabel}
            </NavTab.NavTab>
          ))}
        </NavTab.List>
        <Suspense fallback={<LoadingIndicator center />}>
          <NavTab.CarouselPanels {...panelsProps}>
            {visibleTabRoutes.map((route, index) => (
              <NavTab.Panel key={index}>{route.tabComponent}</NavTab.Panel>
            ))}
          </NavTab.CarouselPanels>
        </Suspense>
      </NavTab.Group>
      <Outlet />
    </div>
  );
};
