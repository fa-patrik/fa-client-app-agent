import { gql } from "@apollo/client";

const PORTFOLIO_REPORT_FIELDS = gql`
  fragment PortfolioReportFields on PortfolioReport {
    marketValue
    valueChangeAbsolute
    portfolio {
      currency {
        securityCode
      }
    }
  }
`;

const PORTFOLIO_REPORT_FIELDS_FOR_PORTFOLIO = gql`
  ${PORTFOLIO_REPORT_FIELDS}
  fragment PortfolioReportFieldsForPortfolio on PortfolioReport {
    portfolioId
    accountBalance
    ...PortfolioReportFields
  }
`;

export const PORTFOLIO_FIELDS = gql`
  ${PORTFOLIO_REPORT_FIELDS_FOR_PORTFOLIO}
  fragment PortfolioFields on Portfolio {
    id
    name
    status
    currency {
      securityCode
    }
    portfolioReport {
      ...PortfolioReportFieldsForPortfolio
    }
  }
`;

const SECURITY_POSITIONS_FIELDS = gql`
  fragment SecurityPositionFields on PortfolioReportItem {
    portfolioId
    security {
      id
      name
    }
    valueChangeAbsolute
  }
`;

// to distinct Contact portfolioReport from Portfolio portfolioReport in Contact version we set portfolioId as portfolio.contact.id
export const SUMMARY_FIELDS = gql`
  ${PORTFOLIO_REPORT_FIELDS}
  fragment SummaryFields on Contact {
    id
    name
    portfolioReport {
      ...PortfolioReportFields
      portfolioId: portfolio {
        id
        contact {
          id
        }
      }
    }
  }
`;

export const DETAILED_PORTFOLIO_FIELDS = gql`
  ${PORTFOLIO_REPORT_FIELDS_FOR_PORTFOLIO}
  ${SECURITY_POSITIONS_FIELDS}
  fragment DetailedPortfolioFields on Portfolio {
    id
    name
    currency {
      securityCode
    }
    portfolioReport {
      ...PortfolioReportFieldsForPortfolio
      securityPositions: portfolioReportItems {
        ...SecurityPositionFields
      }
    }
    analytics(
      parameters: {
        paramsSet: {
          key: "holdingsByType"
          timePeriodCodes: "DAYS-1"
          grouppedByProperties: [TYPE]
          includeData: false
          includeChildren: true
          drilldownEnabled: false
          limit: 0
          locale: $locale
        }
        includeDrilldownPositions: false
      }
    ) {
      allocationTopLevel: grouppedAnalytics(key: "holdingsByType") {
        portfolio {
          id
        }
        allocationByType: grouppedAnalytics {
          code
          name
          figures: firstAnalysis {
            shareOfTotal
          }
        }
      }
    }
  }
`;
