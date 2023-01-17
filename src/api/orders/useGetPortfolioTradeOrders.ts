import { gql, QueryHookOptions, useQuery } from "@apollo/client";
import { useGlobalDateRange } from "hooks/useGlobalDateRange";
import { toShortISOString } from "utils/date";
import { TRADE_ORDERS_DETAILS } from "./fragments";
import { PortfolioTradeOrdersQuery } from "./types";

export const PORTFOLIO_TRADE_ORDERS_QUERY = gql`
  ${TRADE_ORDERS_DETAILS}
  query GetPortfolioTradeOrders(
    $portfolioId: Long
    $startDate: String
    $endDate: String
  ) {
    portfolio(id: $portfolioId) {
      id
      tradeOrders(
        transactionStartDate: $startDate
        transactionEndDate: $endDate
      ) {
        ...TradeOrdersDetails
      }
    }
  }
`;

export const useGetPortfolioTradeOrders = (
  portfolioId: string | undefined,
  options?: QueryHookOptions
) => {
  const dateRangeProps = useGlobalDateRange();
  const { startDate, endDate } = dateRangeProps;

  const { loading, error, data } = useQuery<PortfolioTradeOrdersQuery>(
    PORTFOLIO_TRADE_ORDERS_QUERY,
    {
      variables: {
        startDate: toShortISOString(startDate),
        endDate: toShortISOString(endDate),
        portfolioId,
      },
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      ...options,
    }
  );

  return {
    loading,
    error,
    data: data?.portfolio.tradeOrders,
    ...dateRangeProps,
  };
};
