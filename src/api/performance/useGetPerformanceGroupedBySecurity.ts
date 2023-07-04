import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { TradableSecurity } from "api/trading/useGetTradebleSecurities";
import { PerformanceBySecurityQuery, TimePeriod } from "./types";

const PERFORMANCE_BY_SECURITY_QUERY = gql`
  query GetPerformanceBySecurity(
    $securityIds: [Long]
    $timePeriodCodes: [String]
  ) {
    analytics(
      parameters: {
        secIds: $securityIds
        paramsSet: {
          timePeriodCodes: $timePeriodCodes
          key: "performanceBySecurity"
          grouppedByProperties: [SECURITY]
          includeData: true
          includeChildren: true
        }
      }
    ) {
      grouppedAnalytics(key: "performanceBySecurity") {
        grouppedAnalytics {
          code
          grouppedAnalyticsTimePeriod {
            timePeriodCode
            performance: twr
          }
        }
      }
    }
  }
`;

export const useGetPerformanceGroupedBySecurity = (
  securityIds: string[] | undefined,
  timePeriodCodes: TimePeriod[]
) => {
  const { loading, error, data } = useQuery<PerformanceBySecurityQuery>(
    PERFORMANCE_BY_SECURITY_QUERY,
    {
      variables: {
        securityIds: securityIds,
        timePeriodCodes: timePeriodCodes,
      },
    }
  );

  return {
    loading,
    error,
    data: data?.analytics.grouppedAnalytics,
  };
};

export const useGetPerformanceBySecurityLazy = () => {
  const [getPerformanceBySecurity, { loading, data, error }] =
    useLazyQuery<PerformanceBySecurityQuery>(PERFORMANCE_BY_SECURITY_QUERY);

  const dataAsMap = data?.analytics.grouppedAnalytics.grouppedAnalytics.reduce(
    (prev, currSecurity) => {
      prev[currSecurity.code] = currSecurity.grouppedAnalyticsTimePeriod.reduce(
        (prev, currTimePeriod) => {
          const timePeriodCode = currTimePeriod.timePeriodCode as TimePeriod;
          prev[timePeriodCode] = currTimePeriod.performance;
          return prev;
        },
        {} as Record<TimePeriod, number>
      );
      return prev;
    },
    {} as Record<TradableSecurity["securityCode"], Record<TimePeriod, number>>
  );
  return {
    loading,
    error,
    data: dataAsMap,
    getPerformanceBySecurity,
  };
};
