export enum TimePeriod {
  "DAYS-7" = "DAYS-7", // 1W
  "MONTHS-1" = "MONTHS-1", // 1M
  "MONTHS-3" = "MONTHS-3", // 1Q
  "CALYEAR-0" = "CALYEAR-0", // YTD
  "YEARS-1" = "YEARS-1", // 1Y
  "YEARS-3" = "YEARS-3", // 3Y
  "YEARS-5" = "YEARS-5", // 5Y
  "GIVEN" = "GIVEN", // ALL
}

export enum TimePeriodForGraph {
  "DAYS-7" = "DAYS-7", // 1W
  "MONTHS-1" = "MONTHS-1", // 1M
  "MONTHS-3" = "MONTHS-3", // 1Q
  "CALYEAR-0" = "CALYEAR-0", // YTD
  "GIVEN" = "GIVEN", // ALL
}

export interface PerformanceQuery {
  graph: {
    dailyValues: {
      dailyValue: DailyValue[];
    };
  };
}

export interface DailyValue {
  date: string;
  indexedValue: number;
  benchmarkIndexedValue: number;
}

export interface PerformanceBySecurityQuery {
  security: {
    id: number;
    analytics: {
      grouppedAnalytics: {
        grouppedAnalytics: [
          {
            security: {
              id: number;
            };
            code: string;
            grouppedAnalyticsTimePeriod: [
              {
                timePeriodCode: string;
                performance: number;
              }
            ];
          }
        ];
      };
    };
  };
}
