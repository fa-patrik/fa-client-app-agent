import { gql, useQuery } from "@apollo/client";
import { PORTFOLIO_REPORT_HOLDINGS_DETAILS_FIELDS } from "./fragments";
import type { PortfolioHoldingDetailsQuery } from "./types";

const HOLDING_DETAILS_QUERY = gql`
  ${PORTFOLIO_REPORT_HOLDINGS_DETAILS_FIELDS}
  query GetPortfolioHoldingsFromPfReport($portfolioId: Long) {
    portfolio(id: $portfolioId) {
      id
      portfolioReport {
        portfolioId
        ...PortfolioReportHoldingDetailsFields
      }
    }
  }
`;

/**
 * Gets all holdings of a portfolio from portfolioReport. The benefit of using this
 * is that portfolioReport has more up-to-date figures than analytics+.
 * @param portfolioId the portfolio to get holdings from
 * @param pollInterval optional, how often (ms) to poll the server for fresh data
 * @returns the holdings in the portfolio
 */
export const useGetPortfolioHoldingsFromPfReport = (
  portfolioId: number | undefined,
  pollInterval?: number
) => {
  const { loading, error, data, refetch } =
    useQuery<PortfolioHoldingDetailsQuery>(HOLDING_DETAILS_QUERY, {
      variables: {
        portfolioId,
      },
      pollInterval: pollInterval ?? undefined,
      skip: !portfolioId,
    });

  return {
    loading,
    error,
    data: data?.portfolio?.portfolioReport?.holdingPositions,
    refetch,
  };
};
