import { useEffect } from "react";
import { useGetContactOverview } from "./useGetContactOverview";
import { useLazyGetPortfolioOverview } from "./useGetPortfolioOverview";

/**
 * A hook that attempts to get portfolio analytics data first from cached data
 * Otherwise makes a one-off request to FA to get it.
 * @param id id of portfolio
 * @returns portfolio data required for the Overview and Holdings view
 */
export const useGetPortfolioOverviewSmart = (id: number | undefined) => {
  //first try to get the portfolio data from the contact data cache
  const {
    data: contactData,
    error: contactDataError,
    loading: contactDataLoading,
  } = useGetContactOverview(true);

  const portfolioDataFromContactDataCache =
    contactData?.contact?.analytics?.contact?.parentPortfolios?.find(
      (parentPortfolio) => {
        return parentPortfolio?.portfolio?.id === id;
      }
    );

  const {
    getPortfolioOverview,
    loading: portfolioDataLoading,
    error: portfolioDataError,
    data: portfolioData,
  } = useLazyGetPortfolioOverview(id);

  useEffect(() => {
    const fetchData = async () => {
      await getPortfolioOverview();
    };

    //else, make a one-off request to FA to get the portfolio's data
    if (!portfolioDataFromContactDataCache) {
      fetchData();
    }
  }, [getPortfolioOverview, portfolioDataFromContactDataCache]);

  return {
    loading: contactDataLoading || portfolioDataLoading,
    error: contactDataError || portfolioDataError,
    data:
      portfolioDataFromContactDataCache ||
      portfolioData?.analytics?.grouppedAnalytics,
  };
};
