import { gql } from "@apollo/client";

export const SECURITY_DATA_FRAGMENT = gql`
  fragment SecurityData on GrouppedAnalyticsDTO {
    securities: grouppedAnalytics {
      code
      name
      security {
        id
      }
      firstAnalysis {
        marketValue
        tradeAmount
      }
    }
  }
`;

export const SECURITY_TYPE_FRAGMENT = gql`
  fragment SecurityTypeData on GrouppedAnalyticsDTO {
    securityTypes: grouppedAnalytics {
      code
      name
      firstAnalysis {
        marketValue
        tradeAmount
        shareOfTotal
      }
    }
  }
`;

export const SECURITY_TYPE_WITH_SECURITIES_FRAGMENT = gql`
  fragment SecurityTypeWithSecuritiesData on GrouppedAnalyticsDTO {
    securityTypes: grouppedAnalytics {
      security {
        id
      }
      code
      name
      firstAnalysis {
        marketValue
        tradeAmount
        shareOfTotal
      }
      ...SecurityData
    }
  }
`;

export const PORTFOLIO_CARD_DATA_FRAGMENT = gql`
  fragment PortfolioCardData on GrouppedAnalyticsDTO {
    parentPortfolios: grouppedAnalytics {
      code
      name
      portfolio {
        id
      }
      firstAnalysis {
        marketValue
        tradeAmount
      }
      ...SecurityTypeData
    }
  }
`;