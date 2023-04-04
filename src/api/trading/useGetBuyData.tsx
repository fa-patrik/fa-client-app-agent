import { gql, useQuery } from "@apollo/client";
import { getFetchPolicyOptions } from "api/utils";

const TRANSACTIONS_QUERY = gql`
  query GetBuyData($portfolioId: Long) {
    portfolio(id: $portfolioId) {
      id
      currency {
        securityCode
      }
      portfolioReport(
        adjustPositionsBasedOnOpenTradeOrders: true
        calculateExpectedAmountBasedOpenTradeOrders: true
      ) {
        portfolioId
        accountBalanceAdjustedWithOpenTradeOrders: accountBalance
      }
    }
  }
`;

interface PortfolioTransactionsQuery {
  portfolio: {
    currency: {
      securityCode: string;
    };
    portfolioReport: {
      accountBalanceAdjustedWithOpenTradeOrders: number;
    };
  };
}

export const useGetBuyData = (portfolioId: string | undefined) => {
  const { loading, error, data } = useQuery<PortfolioTransactionsQuery>(
    TRANSACTIONS_QUERY,
    {
      variables: {
        portfolioId,
      },
      ...getFetchPolicyOptions(`useGetBuyData.${portfolioId}`),
    }
  );

  return {
    loading,
    error,
    data: data && {
      availableCash:
        data.portfolio?.portfolioReport
          ?.accountBalanceAdjustedWithOpenTradeOrders,
      currency: data.portfolio?.currency?.securityCode,
    },
  };
};
