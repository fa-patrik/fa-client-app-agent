import { gql } from "@apollo/client";

export const SECURITY_DATA_FRAGMENT = gql`
  fragment SecurityData on GrouppedAnalyticsDTO {
    securities: grouppedAnalytics {
      code
      name
      security {
        id
        isinCode
        countryCode
        currencyCode
        tagsAsList
        securityTypeCode
      }
      firstAnalysis {
        marketValue
        tradeAmount
        amount
        accruedInterest
        purchaseTradeAmount
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
