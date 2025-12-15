import { AccessBanner } from "components/Banner/AccessBanner";
import ConfiguredBanner from "components/Banner/ConfiguredBanner";
import { PageLayout } from "layouts/PageLayout/PageLayout";
import { Outlet } from "react-router-dom";
import { DetailsHeader } from "./DetailsHeader";
import { DetailsHeaderProvider } from "./DetailsHeaderContext";

interface DetailsHeaderProps {
  hideLogo?: boolean;
  hideUserMenu?: boolean;
  hideBackButton?: boolean;
  hideAvatar?: boolean;
  children?: React.ReactNode;
}

export const DetailsLayout = ({
  hideLogo = false,
  hideUserMenu = false,
  hideBackButton = false,
  hideAvatar = false,
  children,
}: DetailsHeaderProps) => {
  return (
    <div className="flex flex-col h-full">
      <AccessBanner />
      <ConfiguredBanner />
      <DetailsHeaderProvider>
        <DetailsHeader
          hideLogo={hideLogo}
          hideUserMenu={hideUserMenu}
          hideBackButton={hideBackButton}
          hideAvatar={hideAvatar}
        />
        <PageLayout>{children ? children : <Outlet />}</PageLayout>
      </DetailsHeaderProvider>
    </div>
  );
};
