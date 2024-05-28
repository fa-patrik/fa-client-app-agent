import { AccessModeBanner } from "components/Banner/AccessModeBanner";
import ConfiguredBanner from "components/Banner/ConfiguredBanner";
import { Outlet } from "react-router-dom";
import { PortfolioNavigationHeader } from "./PortfolioNavigationHeader/PortfolioNavigationHeader";

export const PortfolioNavigationHeaderLayout = () => {
  return (
    <div className="flex flex-col h-full">
      <AccessModeBanner />
      <ConfiguredBanner />
      <PortfolioNavigationHeader />
      <Outlet />
    </div>
  );
};
