import { gql, useQuery } from "@apollo/client";
import type { AccountCategory, AccountType } from "api/enums";
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
        number
        name
        category
        type
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
        accountItems {
          id
          accountId
          balanceAccCurr
        }
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
      number: string;
      name: string;
      category: AccountCategory;
      type: AccountType;
      currency: {
        id: number;
        amountDecimalCount: number;
        securityCode: string;
        fxRate: number;
      };
    }[];
    portfolioReport: {
      accountItems: {
        id: number;
        accountId: number;
        balanceAccCurr: number;
      }[];
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
