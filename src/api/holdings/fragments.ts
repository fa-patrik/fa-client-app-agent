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
