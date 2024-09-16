import {
  PortfolioGroups,
  RepresentativeTag,
} from "api/common/useGetContactInfo";
import { Navigate, useRoutes } from "react-router-dom";
import { PermissionMode, useFeature } from "services/permissions/usePermission";
import { NavTabLayout } from "../NavTabLayout";
import { NavTabPath } from "./types";

interface NavTabRoutesProps {
  routes: NavTabPath[];
}

export const NavTabRoutes = ({ routes }: NavTabRoutesProps) => {
  const { canFeature: canTrade } = useFeature(
    PortfolioGroups.TRADE,
    RepresentativeTag.TRADE,
    PermissionMode.SELECTED_ANY
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
