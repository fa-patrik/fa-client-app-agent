import { gql } from "@apollo/client";

export const PORTFOLIO_REPORT_HOLDINGS_DETAILS_FIELDS = gql`
  fragment PortfolioReportHoldingDetailsFields on PortfolioReport {
    holdingPositions: portfolioReportItems {
      portfolioId
      security {
        id
      }
      amount
      purchaseTradeAmount
      marketValue
      marketFxRate
    }
  }
`;
