import { gql, useQuery } from "@apollo/client";
import { getFetchPolicyOptions } from "api/utils";
import { PORTFOLIO_REPORT_HOLDINGS_DETAILS_FIELDS } from "./fragments";
import { HoldingPosition, PortfolioHoldingDetailsQuery } from "./types";

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
 * Gets all holdings of a portfolio from portfolioReport and then finds the
 * holding of the provided security id and returns it. The benefit of using this
 * is that portfolioReport has more up-to-date figures than analytics+.
 * @param portfolioId the portfolio to get holdings from
 * @param securityId the id of the holding to get from the portfolio
 * @returns the holding in the portfolio
 */
export const useGetPortfolioHoldingFromPfReport = (
  portfolioId: number | undefined,
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

/**
 * @returns the holding matching the id and amount not 0.
 */
const findHolding = (
  holdingPositions: HoldingPosition[] | undefined,
  securityId: string | undefined
) => {
  return holdingPositions?.find(
    (holding) =>
      holding.security?.id.toString() === securityId && holding.amount !== 0
  );
};
