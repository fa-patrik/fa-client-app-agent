import { useEffect } from "react";
import { useNavigation } from "hooks/useNavigation";
import { useLocation, useParams } from "react-router-dom";
import type { NavTabPath } from "./NavTab/types";

/**
 * Redirects to overview if the current URL path doesn't match any visible tab.
 * This handles the case where a user navigates directly to a tab URL they don't have access to.
 */
export const useRedirectIfInvalidTab = (visibleTabRoutes: NavTabPath[]) => {
  const { navigate } = useNavigation();
  const location = useLocation();
  const { portfolioId } = useParams();

  useEffect(() => {
    // Get the current tab from the URL
    const activePath = location.pathname.split("/").slice(-1)[0];

    // Check if the current path matches any visible tab
    const isValidTab = visibleTabRoutes.some(
      (route) => route.path === activePath
    );

    // If not a valid tab, redirect to overview
    if (!isValidTab && activePath) {
      const redirectPath = portfolioId
        ? `portfolio/${portfolioId}/overview`
        : "overview";
      console.debug(
        `[useRedirectIfInvalidTab] Redirecting to "${redirectPath}": tab "${activePath}" is not in visible tabs [${visibleTabRoutes.map((r) => r.path).join(", ")}]`
      );
      navigate(redirectPath, { replace: true });
    }
  }, [location.pathname, visibleTabRoutes, navigate, portfolioId]);
};
