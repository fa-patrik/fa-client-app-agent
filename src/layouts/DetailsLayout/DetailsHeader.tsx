import { UserMenu, BackNavigationButton, Logo } from "components";
import { SelectedContactAvatar } from "components/Avatar/SelectedContactAvatar";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useLocation, useNavigate } from "react-router-dom";
import { useDetailsHeaderContext } from "./DetailsHeaderContext";

interface DetailsHeaderProps {
  hideLogo?: boolean;
  hideUserMenu?: boolean;
  hideBackButton?: boolean;
  hideAvatar?: boolean;
}

export const DetailsHeader = ({
  hideLogo = false,
  hideUserMenu = false,
  hideBackButton = false,
  hideAvatar = false,
}: DetailsHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const parentPath = location.pathname.split("/").slice(0, -1).join("/");
  const showLogoAndUserMenu = useMatchesBreakpoint("sm");
  const { header } = useDetailsHeaderContext();

  return (
    <div className="z-20 bg-white border-b shadow-md p-2">
      <div className="container flex gap-2 justify-between items-center mx-auto">
        {!hideLogo && showLogoAndUserMenu && <Logo />}
        <div className="flex items-center text-lg sm:text-2xl font-bold mr-auto min-w-0">
          {!hideBackButton && (
            <BackNavigationButton onClick={() => navigate(parentPath)} />
          )}
          {header && (
            <div className="overflow-hidden whitespace-nowrap text-ellipsis">
              {header}
            </div>
          )}
        </div>
        <div className="flex gap-x-2 items-center shrink-0">
          {!hideUserMenu && <UserMenu />}
          {!hideAvatar && <SelectedContactAvatar />}
        </div>
      </div>
    </div>
  );
};
