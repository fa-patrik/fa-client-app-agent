import { Navigate, useRoutes } from "react-router-dom";
import { NavTabLayout } from "../NavTabLayout";
import { NavTabPath } from "./types";

interface NavTabRoutesProps {
  routes: NavTabPath[];
}

export const NavTabRoutes = ({ routes }: NavTabRoutesProps) => {
  // All filtering logic is now handled at the UI level in NavTabLayout
  // Routes are always available, but tabs are conditionally visible

  return useRoutes([
    {
      path: "",
      element: <NavTabLayout routes={routes} />,
      children: routes,
    },
    {
      path: "*",
      element: <Navigate to="overview" replace />,
    },
  ]);
};
