import { useEffect } from "react";
import { useGetPortfolioOptions } from "hooks/useGetPortfolioOptions";
import { useParams } from "react-router-dom";
import { useNavigateToPortfolioTab } from "./useNavigateToPortfolioTab";

export const useRedirectIfOnlyOnePortfolio = () => {
  const navigateToPortfolioTab = useNavigateToPortfolioTab();
  const portfolioOptions = useGetPortfolioOptions();
  const { portfolioId } = useParams();
  useEffect(() => {
    if (portfolioOptions.length === 1 && !portfolioId) {
      console.debug(
        `[useRedirectIfOnlyOnePortfolio] Auto-selecting the only available portfolio: ${portfolioOptions[0].label} (${portfolioOptions[0].urlPrefix})`
      );
      navigateToPortfolioTab(portfolioOptions[0].urlPrefix);
    }
  }, [navigateToPortfolioTab, portfolioOptions, portfolioId]);
};
