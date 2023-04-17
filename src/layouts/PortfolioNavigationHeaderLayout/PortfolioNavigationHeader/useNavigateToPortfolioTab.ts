import { useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export const useNavigateToPortfolioTab = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  return useCallback(
    (urlPrefix: string) => {
      const contactId = params?.contactDbId;
      const currentTab = location.pathname.split("/").at(-1);
      //handle impersonation mode
      const newPath = contactId
        ? `/impersonate/${contactId}${urlPrefix}/${currentTab}`
        : `${urlPrefix}/${currentTab}`;
      navigate(newPath);
    },
    [location.pathname, navigate, params?.contactDbId]
  );
};
