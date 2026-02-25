import { UserMenu, Logo, PortfolioSelect } from "components";
import { SelectedContactAvatar } from "components/Avatar/SelectedContactAvatar";
import { type PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { ThemeToggle } from "components/ThemeToggle/ThemeToggle";
import {
  TOTAL_INVESTMENTS_OPTION_ID,
  useGetPortfolioOptions,
} from "hooks/useGetPortfolioOptions";
import { useParams } from "react-router-dom";
import { useNavigateToPortfolioTab } from "./useNavigateToPortfolioTab";
import { useRedirectIfInvalidPortfolio } from "./useRedirectIfInvalidPortfolio";
import { useRedirectIfOnlyOnePortfolio } from "./useRedirectIfOnlyOnePortfolio";

export const PortfolioNavigationHeader = () => {
  const portfolioOptions = useGetPortfolioOptions();
  const { portfolioId: portfolioIdUrl } = useParams();
  const portfolioId = portfolioIdUrl
    ? parseInt(portfolioIdUrl, 10)
    : TOTAL_INVESTMENTS_OPTION_ID;
  const navigateToPortfolioTab = useNavigateToPortfolioTab();
  const onPortfolioChange = (selectedOption: PortfolioOption | undefined) => {
    if (selectedOption) {
      navigateToPortfolioTab(selectedOption.urlPrefix);
    }
  };

  useRedirectIfInvalidPortfolio();
  useRedirectIfOnlyOnePortfolio();

  return (
    <div className="z-20 p-2 bg-white dark:bg-gray-800">
      <div className="container flex gap-2 justify-between items-center mx-auto">
        <Logo />
        <div className="flex items-center mr-auto">
          <PortfolioSelect
            portfolioOptions={portfolioOptions}
            portfolioId={portfolioId}
            onChange={onPortfolioChange}
          />
        </div>
        <div className="flex gap-x-2 items-center">
          <ThemeToggle />
          <UserMenu />
          <SelectedContactAvatar />
        </div>
      </div>
    </div>
  );
};
