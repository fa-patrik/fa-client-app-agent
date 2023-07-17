import { Navigate, useRoutes } from "react-router-dom";
import {
  canPortfolioTrade,
  PermissionMode,
  usePermission,
} from "services/permissions/usePermission";
import { NavTabLayout } from "../NavTabLayout";
import { NavTabPath } from "./types";

interface NavTabRoutesProps {
  routes: NavTabPath[];
}

export const NavTabRoutes = ({ routes }: NavTabRoutesProps) => {
  const canTrade = usePermission(
    PermissionMode.SELECTED_ANY,
    canPortfolioTrade
  );

  const filteredRoutes = routes.filter(
    (route) => canTrade || route.path !== "trading"
  );

  return useRoutes([
    {
      path: "",
      element: <NavTabLayout routes={filteredRoutes} />,
      children: filteredRoutes,
    },
    {
      path: "*",
      element: <Navigate to="overview" replace />,
    },
  ]);
};
