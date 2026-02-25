import type { ReactNode } from "react";
import { UserMenu, BackNavigationButton, Logo } from "components";
import { SelectedContactAvatar } from "components/Avatar/SelectedContactAvatar";
import { AccessBanner } from "components/Banner/AccessBanner";
import ConfiguredBanner from "components/Banner/ConfiguredBanner";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";

export interface HeadingProps {
  children: ReactNode;
  onBackButtonClick: () => void;
}

export const DetailsHeading = ({
  children,
  onBackButtonClick,
}: HeadingProps) => {
  const showLogoAndUserMenu = useMatchesBreakpoint("md");
  return (
    <div className="z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-md">
      <AccessBanner />
      <ConfiguredBanner />
      <div className="container flex gap-2 justify-between items-center py-2 px-2 mx-auto">
        {showLogoAndUserMenu && <Logo />}
        <div className="flex shrink justify-start items-center w-3/4 sm:w-5/6 text-2xl font-bold">
          <BackNavigationButton onClick={onBackButtonClick} />
          <div className="overflow-hidden whitespace-nowrap text-ellipsis">
            {children}
          </div>
        </div>
        <div className="flex gap-x-2 justify-end items-center">
          {showLogoAndUserMenu && <UserMenu />}
          <SelectedContactAvatar />
        </div>
      </div>
    </div>
  );
};
