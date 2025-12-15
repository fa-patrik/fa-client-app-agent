import { useEffect } from "react";
import { useGetPortfolioOptions } from "hooks/useGetPortfolioOptions";
import { useParams } from "react-router-dom";
import { useNavigateToPortfolioTab } from "./useNavigateToPortfolioTab";
// Recursively check if portfolioId exists among options or their subOptions
const containsPortfolioId = (
  options: ReturnType<typeof useGetPortfolioOptions>,
  id: number
): boolean => {
  for (const opt of options) {
    if (opt.id === id) return true;
    if (opt.subOptions?.length && containsPortfolioId(opt.subOptions, id))
      return true;
  }
  return false;
};

/**
 * When navigating under /portfolio/:portfolioId and the selected contact changes,
 * the previously selected portfolio might not belong to the new contact anymore.
 * This hook detects that situation and redirects to 'Total investments'.
 */
export const useRedirectIfInvalidPortfolio = () => {
  const navigateToPortfolioTab = useNavigateToPortfolioTab();
  const { portfolioId: portfolioIdParam } = useParams();
  const portfolioOptions = useGetPortfolioOptions();

  useEffect(() => {
    if (!portfolioIdParam) return; // not on a portfolio-specific route
    const parsedId = parseInt(portfolioIdParam, 10);
    //invalid id
    if (Number.isNaN(parsedId)) {
      console.debug(
        `[useRedirectIfInvalidPortfolio] Redirecting to Total investments: portfolio ID "${portfolioIdParam}" is not a valid number`
      );
      return navigateToPortfolioTab("");
    }

    const exists = containsPortfolioId(portfolioOptions, parsedId);
    if (!exists) {
      console.debug(
        `[useRedirectIfInvalidPortfolio] Redirecting to Total investments: portfolio ID ${parsedId} does not exist in current contact's portfolios`
      );
      navigateToPortfolioTab("");
    }
  }, [portfolioIdParam, portfolioOptions, navigateToPortfolioTab]);
};
