import type { QueryHookOptions } from "@apollo/client";
import { gql, useQuery } from "@apollo/client";
import { useGetSubPortfolioIds } from "api/common/useGetSubPortfolioIds";
import { useGlobalDateRange } from "hooks/useGlobalDateRange";
import { toShortISOString } from "utils/date";
import { TRANSACTION_FIELDS } from "./fragments";
import type { PortfolioTransactionsQuery, Transaction } from "./types";

const TRANSACTIONS_QUERY = gql`
  ${TRANSACTION_FIELDS}
  query GetPortfolioTransactions(
    $startDate: String
    $endDate: String
    $portfolioIds: [String]
  ) {
    portfolios(ids: $portfolioIds) {
      id
      transactions(startDate: $startDate, endDate: $endDate) {
        ...TransactionsFields
      }
    }
  }
`;

export const useGetPortfolioTransactions = (
  portfolioId: number | undefined,
  options?: QueryHookOptions
) => {
  const portfolioIds = useGetSubPortfolioIds(portfolioId);
  const dateRangeProps = useGlobalDateRange();
  const { startDate, endDate } = dateRangeProps;

  const { loading, error, data } = useQuery<PortfolioTransactionsQuery>(
    TRANSACTIONS_QUERY,
    {
      variables: {
        startDate: toShortISOString(startDate),
        endDate: toShortISOString(endDate),
        portfolioIds: portfolioIds,
      },
      fetchPolicy: "cache-and-network",
      ...options,
    }
  );

  return {
    loading,
    error,
    data: data?.portfolios.reduce((prev, curr) => {
      if (curr.transactions?.length) prev.push(...curr.transactions);
      return prev;
    }, [] as Transaction[]),
    ...dateRangeProps,
  };
};
