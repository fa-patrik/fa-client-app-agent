import { ImpersonationBanner } from "components/ImpersonationBanner/ImpersonationBanner";
import { useKeycloak } from "providers/KeycloakProvider";
import { Outlet } from "react-router-dom";
import { PortfolioNavigationHeader } from "./PortfolioNavigationHeader/PortfolioNavigationHeader";

export const PortfolioNavigationHeaderLayout = () => {
  const { readonly } = useKeycloak();
  return (
    <div className="flex flex-col h-full">
      {readonly && <ImpersonationBanner />}
      <PortfolioNavigationHeader />
      <Outlet />
    </div>
  );
};
