import { useCallback } from "react";
import { useNavigation } from "hooks/useNavigation";
import { useLocation } from "react-router-dom";

export const useNavigateToPortfolioTab = () => {
  const { navigate } = useNavigation();
  const location = useLocation();
  return useCallback(
    (urlPrefix: string) => {
      const currentTab = location.pathname.split("/").at(-1);
      //handle impersonation mode
      const newPath = `${urlPrefix}/${currentTab}`;
      navigate(newPath);
    },
    [location.pathname, navigate]
  );
};
