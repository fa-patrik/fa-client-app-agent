import { UserMenu, Logo, PortfolioSelect } from "components";
import { SelectedContactAvatar } from "components/Avatar/SelectedContactAvatar";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import {
  TOTAL_INVESTMENTS_OPTION_ID,
  useGetPortfolioOptions,
} from "hooks/useGetPortfolioOptions";
import { Navigate, useParams } from "react-router-dom";
import { useNavigateToPortfolioTab } from "./useNavigateToPortfolioTab";
import { useRedirectIfOnlyOnePortfolio } from "./useRedirectIfOnlyOnePortfolio";

export const PortfolioNavigationHeader = () => {
  const portfolioOptions = useGetPortfolioOptions();
  const { contactDbId, portfolioId: portfolioIdUrl } = useParams();
  const portfolioId = portfolioIdUrl
    ? parseInt(portfolioIdUrl, 10)
    : TOTAL_INVESTMENTS_OPTION_ID;
  const navigateToPortfolioTab = useNavigateToPortfolioTab();
  useRedirectIfOnlyOnePortfolio();
  const onPortfolioChange = (selectedOption: PortfolioOption) => {
    navigateToPortfolioTab(selectedOption.urlPrefix);
  };

  // redirect to root when portfolioId does not match available portfolios
  if (
    portfolioId !== TOTAL_INVESTMENTS_OPTION_ID &&
    !portfolioOptions.some(
      (option) =>
        option.id === portfolioId ||
        //Extend this to a recursive operation to check subs of subs
        option?.subOptions?.some((subOption) => subOption.id === portfolioId)
    )
  ) {
    //handle impersonation mode
    if (contactDbId) return <Navigate to={`/impersonate/${contactDbId}/`} />;
    return <Navigate to="/" replace />;
  }

  return (
    <div className="z-20 px-2 pt-2 bg-white">
      <div className="container flex gap-2 justify-between items-center mx-auto">
        <Logo />
        <div className="flex-auto flex-shrink justify-start w-1/2 sm:min-w-[350px]">
          {portfolioOptions.length > 0 ? (
            <div className="max-w-[350px]">
              <PortfolioSelect
                portfolioOptions={portfolioOptions}
                portfolioId={portfolioId}
                onChange={onPortfolioChange}
              />
            </div>
          ) : (
            <div />
          )}
        </div>
        <div className="flex gap-x-2 items-center">
          <UserMenu />
          <SelectedContactAvatar />
        </div>
      </div>
    </div>
  );
};
