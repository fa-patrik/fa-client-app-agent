import { ImpersonationBanner } from "components/ImpersonationBanner/ImpersonationBanner";
import { Outlet } from "react-router-dom";
import { PortfolioNavigationHeader } from "./PortfolioNavigationHeader/PortfolioNavigationHeader";

interface PortfolioNavigationHeaderLayoutProps {
  displayBanner?: boolean;
}

export const PortfolioNavigationHeaderLayout = ({
  displayBanner,
}: PortfolioNavigationHeaderLayoutProps) => {
  return (
    <div className="flex flex-col h-full">
      {displayBanner && <ImpersonationBanner />}
      <PortfolioNavigationHeader />
      <Outlet />
    </div>
  );
};
