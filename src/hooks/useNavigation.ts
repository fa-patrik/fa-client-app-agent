import { useCallback } from "react";
import {
  useNavigate,
  useParams,
  type NavigateOptions,
  type To,
} from "react-router-dom";

/**
 * Abstraction hook for navigation that handles impersonation routes.
 */
export const useNavigation = () => {
  const { impersonateId } = useParams();
  const navigate = useNavigate();

  /**
   * Builds a path with impersonation prefix if currently impersonating
   */
  const buildPath = useCallback(
    (path: string): string => {
      // Normalize path to start with /
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;

      if (impersonateId) {
        //prefix path with impersonation segment
        return `/impersonate/${impersonateId}${normalizedPath}`;
      }
      return normalizedPath;
    },
    [impersonateId]
  );

  /**
   * Navigate with automatic impersonation handling
   */
  const navigateWithImpersonation = useCallback(
    (to: To, options?: NavigateOptions) => {
      if (typeof to === "string") {
        navigate(buildPath(to), options);
      } else {
        // Handle object-style navigation
        const updatedTo = {
          ...to,
          pathname: to.pathname ? buildPath(to.pathname) : undefined,
        };
        navigate(updatedTo, options);
      }
    },
    [navigate, buildPath]
  );

  return {
    /** Navigate with automatic impersonation handling */
    navigate: navigateWithImpersonation,
  };
};
