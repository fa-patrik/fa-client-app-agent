import { gql, useQuery } from "@apollo/client";
import { PORTFOLIO_REPORT_HOLDINGS_DETAILS_FIELDS } from "api/holdings/fragments";
import { HoldingPosition } from "api/holdings/types";
import { getFetchPolicyOptions } from "api/utils";

const SELL_DATA_QUERY = gql`
  ${PORTFOLIO_REPORT_HOLDINGS_DETAILS_FIELDS}
  query GetSellData($portfolioId: Long, $quoteCurrency: String) {
    portfolio(id: $portfolioId) {
      id
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
      portfolioReport {
        portfolioId
        ...PortfolioReportHoldingDetailsFields
      }
    }
  }
`;

interface SellData {
  portfolio: {
    currency: {
      id: number;
      amountDecimalCount: number;
      securityCode: string;
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
      holdingPositions: HoldingPosition[];
    };
  };
}

export const useGetSellData = (
  portfolioId: number | undefined,
  quoteCurrency?: string
) => {
  const { loading, error, data } = useQuery<SellData>(SELL_DATA_QUERY, {
    variables: {
      portfolioId,
      quoteCurrency,
    },
    skip: !portfolioId,
    ...getFetchPolicyOptions(`GetSellData.${portfolioId}.${quoteCurrency}`),
  });

  return {
    loading,
    error,
    data,
  };
};
