import { gql, useQuery } from "@apollo/client";
import { getFetchPolicyOptions } from "api/utils";
import { PORTFOLIO_REPORT_HOLDINGS_DETAILS_FIELDS } from "./fragments";
import { PortfolioHoldingDetailsQuery } from "./types";
import { findHolding } from "./useGetAllPortfoliosHoldingDetails";

const HOLDING_DETAILS_QUERY = gql`
  ${PORTFOLIO_REPORT_HOLDINGS_DETAILS_FIELDS}
  query GetPortfolioHoldingDetails($portfolioId: Long) {
    portfolio(id: $portfolioId) {
      id
      portfolioReport {
        portfolioId
        ...PortfolioReportHoldingDetailsFields
      }
    }
  }
`;

export const useGetPortfolioHoldingDetails = (
  portfolioId: string | undefined,
  securityId: string | undefined
) => {
  const { loading, error, data } = useQuery<PortfolioHoldingDetailsQuery>(
    HOLDING_DETAILS_QUERY,
    {
      variables: {
        portfolioId,
      },
      ...getFetchPolicyOptions(`useGetPortfolioHoldingDetails.${portfolioId}`),
    }
  );

  return {
    loading,
    error,
    data: findHolding(
      data?.portfolio?.portfolioReport?.holdingPositions,
      securityId
    ),
  };
};
