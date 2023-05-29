import { useQuery } from "@apollo/client";
import { useGetSubPortfolioIds } from "api/generic/useGetSubPortfolioIds";
import { PERFORMANCE_PORTFOLIO_INDEXED_VALUE } from "./fragments";
import { PerformanceQuery } from "./types";

export const useGetPerformance = (
  portfolioId: number,
  timePeriod: string | number
) => {
  const subPortfolioIds = useGetSubPortfolioIds(portfolioId);
  const { loading, error, data } = useQuery<PerformanceQuery>(
    PERFORMANCE_PORTFOLIO_INDEXED_VALUE,
    {
      variables: {
        portfolioIds: portfolioId ? [portfolioId, ...subPortfolioIds] : [],
        timePeriod,
      },
    }
  );

  return { loading, error, data: data?.graph?.dailyValues };
};
