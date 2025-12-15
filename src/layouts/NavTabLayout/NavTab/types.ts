import type { ReactNode } from "react";

/**
 path - URL path pattern, when matches tabComponent will be rendered
 element - required by React Router, do not have any effect because NavTabLayout do not have Outlet
 tabLabel - text that will be displayed on navigation tab
 tabComponent - component that will be rendered when URL matches path
 */

export interface NavTabPath {
  path: string;
  element: null;
  tabLabel: ReactNode;
  tabComponent: ReactNode;
}
