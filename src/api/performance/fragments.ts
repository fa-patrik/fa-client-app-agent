import { gql } from "@apollo/client";

export const PERFORMANCE_PORTFOLIO_INDEXED_VALUE = gql`
  query PortfolioIndexedValue($portfolioIds: [Long], $timePeriod: [String]) {
    graph: analytics(
      withoutPositionData: true
      parameters: {
        pfIds: $portfolioIds
        paramsSet: {
          timePeriodCodes: $timePeriod
          includeData: true
          drilldownEnabled: false
          limit: 0
        }
        includeDrilldownPositions: false
      }
    ) {
      dailyValues: grouppedAnalytics(key: "1") {
        dailyValue: indexedReturnData {
          date
          indexedValue
          benchmarkIndexedValue
        }
      }
    }
  }
`;
