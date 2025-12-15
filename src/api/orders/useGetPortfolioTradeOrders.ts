import type { QueryHookOptions } from "@apollo/client";
import { gql, useQuery } from "@apollo/client";
import { useGetSubPortfolioIds } from "api/common/useGetSubPortfolioIds";
import { useGlobalDateRange } from "hooks/useGlobalDateRange";
import { toShortISOString } from "utils/date";
import { TRADE_ORDERS_DETAILS } from "./fragments";
import type { PortfolioTradeOrdersQuery, TradeOrder } from "./types";

export const PORTFOLIO_TRADE_ORDERS_QUERY = gql`
  ${TRADE_ORDERS_DETAILS}
  query GetPortfolioTradeOrders(
    $portfolioIds: [String]
    $startDate: String
    $endDate: String
  ) {
    portfolios(ids: $portfolioIds) {
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
  portfolioId: number | undefined,
  options?: QueryHookOptions
) => {
  const portfolioIds = useGetSubPortfolioIds(portfolioId);
  const dateRangeProps = useGlobalDateRange();
  const { startDate, endDate } = dateRangeProps;

  const { loading, error, data } = useQuery<PortfolioTradeOrdersQuery>(
    PORTFOLIO_TRADE_ORDERS_QUERY,
    {
      variables: {
        startDate: toShortISOString(startDate),
        endDate: toShortISOString(endDate),
        portfolioIds: portfolioIds,
      },
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      ...options,
    }
  );

  return {
    loading,
    error,
    data: data?.portfolios?.reduce((prev, curr) => {
      if (curr?.tradeOrders?.length) prev.push(...curr.tradeOrders);
      return prev;
    }, [] as TradeOrder[]),
    ...dateRangeProps,
  };
};
