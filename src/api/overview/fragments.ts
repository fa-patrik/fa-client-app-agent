import { gql } from "@apollo/client";

export const PORTFOLIO_DATA_FRAGMENT = gql`
  fragment PortfolioData on GrouppedAnalyticsDTO {
    parentPortfolios: grouppedAnalytics {
      portfolio {
        id
      }
      firstAnalysis {
        marketValue
        tradeAmount
      }
      ...SecurityTypeWithSecuritiesData
    }
  }
`;
