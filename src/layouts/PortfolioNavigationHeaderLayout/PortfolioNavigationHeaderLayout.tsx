import { AccessBanner } from "components/Banner/AccessBanner";
import ConfiguredBanner from "components/Banner/ConfiguredBanner";
import { Outlet } from "react-router-dom";
import { PortfolioNavigationHeader } from "./PortfolioNavigationHeader/PortfolioNavigationHeader";
export const PortfolioNavigationHeaderLayout = () => {
  return (
    <div className="flex flex-col h-full">
      <AccessBanner />
      <ConfiguredBanner />
      <PortfolioNavigationHeader />
      <Outlet />
    </div>
  );
};
