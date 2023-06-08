import { useQuery } from "@apollo/client";
import { useGetSubPortfolioIds } from "api/generic/useGetSubPortfolioIds";
import { PERFORMANCE_PORTFOLIO_INDEXED_VALUE } from "./fragments";
import { PerformanceQuery } from "./types";

export const useGetPerformance = (
  portfolioId: number,
  timePeriod: string | number
) => {
  const ids = useGetSubPortfolioIds(portfolioId);
  const { loading, error, data } = useQuery<PerformanceQuery>(
    PERFORMANCE_PORTFOLIO_INDEXED_VALUE,
    {
      variables: {
        portfolioIds: ids,
        timePeriod,
      },
    }
  );

  return { loading, error, data: data?.graph?.dailyValues };
};
