import { gql, useQuery } from "@apollo/client";
import { getFetchPolicyOptions } from "api/utils";

const BUY_DATA_QUERY = gql`
  query GetBuyData($portfolioId: Long, $quoteCurrency: String) {
    portfolio(id: $portfolioId) {
      id
      currency {
        securityCode
        amountDecimalCount
      }
      defaultAccount
      accounts {
        id
        currency {
          id
          securityCode
          amountDecimalCount
          fxRate(quoteCurrency: $quoteCurrency)
        }
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

interface BuyData {
  portfolio: {
    currency: {
      securityCode: string;
      amountDecimalCount: number;
    };
    defaultAccount: string;
    accounts: {
      id: number;
      currency: {
        id: number;
        amountDecimalCount: number;
        securityCode: string;
        fxRate: number;
      };
    }[];
    portfolioReport: {
      accountBalanceAdjustedWithOpenTradeOrders: number;
    };
  };
}

export const useGetBuyData = (
  portfolioId: number | undefined,
  quoteCurrency: string | undefined
) => {
  const { loading, error, data } = useQuery<BuyData>(BUY_DATA_QUERY, {
    variables: {
      portfolioId,
      quoteCurrency,
    },
    skip: !portfolioId || !quoteCurrency,
    ...getFetchPolicyOptions(`useGetBuyData.${portfolioId}.${quoteCurrency}`),
  });

  return {
    loading,
    error,
    data: data?.portfolio,
  };
};
