import ConfiguredBanner from "components/Banner/ConfiguredBanner";
import { ImpersonationBanner } from "components/Banner/ImpersonationBanner";
import { useKeycloak } from "providers/KeycloakProvider";
import { Outlet } from "react-router-dom";
import { PortfolioNavigationHeader } from "./PortfolioNavigationHeader/PortfolioNavigationHeader";

export const PortfolioNavigationHeaderLayout = () => {
  const { impersonating } = useKeycloak();
  return (
    <div className="flex flex-col h-full">
      {impersonating && <ImpersonationBanner />}
      <ConfiguredBanner />
      <PortfolioNavigationHeader />
      <Outlet />
    </div>
  );
};
