import { useState } from "react";
import type { OperationVariables } from "@apollo/client";
import { ApolloError, gql, useApolloClient, useQuery } from "@apollo/client";
import type { TradableSecurity } from "api/trading/useGetTradebleSecurities";
import type { PerformanceBySecurityQuery, TimePeriod } from "./types";

const SECURITY_PERFORMANCE_FRAGMENT = gql`
  fragment SecurityPerformance on Security {
    id
    analytics(
      parameters: {
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
          security {
            id
          }
          grouppedAnalyticsTimePeriod {
            timePeriodCode
            performance: twr
          }
        }
      }
    }
  }
`;

export const PERFORMANCE_BY_SECURITY_QUERY = gql`
  ${SECURITY_PERFORMANCE_FRAGMENT}
  query GetPerformanceBySecurity(
    $securityId: Long
    $timePeriodCodes: [String]
  ) {
    security(id: $securityId) {
      ...SecurityPerformance
    }
  }
`;

export const useGetPerformanceGroupedBySecurity = (
  securityId: number | undefined,
  timePeriodCodes: TimePeriod[]
) => {
  const { loading, error, data } = useQuery<PerformanceBySecurityQuery>(
    PERFORMANCE_BY_SECURITY_QUERY,
    {
      variables: {
        securityId: securityId,
        timePeriodCodes: timePeriodCodes,
      },
    }
  );

  return {
    loading,
    error,
    data: data?.security.analytics.grouppedAnalytics,
  };
};

export const useGetPerformanceBySecurityLazy = () => {
  const [error, setError] = useState<ApolloError | undefined>();
  const [loading, setLoading] = useState<
    Record<TradableSecurity["id"], boolean>
  >({});
  const client = useApolloClient();

  const getPerformanceBySecurity = async (variables: OperationVariables) => {
    const vars = variables as {
      securityId: number;
      timePeriodCodes: string[];
    };
    setLoading(() => ({ [vars.securityId]: true }));
    try {
      const result = await client.query({
        query: PERFORMANCE_BY_SECURITY_QUERY,
        variables,
        fetchPolicy: "cache-first",
      });
      setError(undefined);
      setLoading(() => ({ [vars.securityId]: false }));
      return result;
    } catch (err) {
      setLoading(() => ({ [vars.securityId]: false }));
      if (err instanceof ApolloError) setError(err);
    }
  };

  return {
    getPerformanceBySecurity,
    loading,
    error,
  };
};

export const transformMap = (data: PerformanceBySecurityQuery | undefined) => {
  if (!data) return;

  return data?.security.analytics.grouppedAnalytics.grouppedAnalytics.reduce(
    (prevSecurity, currSecurity) => {
      const securityPerformance =
        currSecurity.grouppedAnalyticsTimePeriod.reduce(
          (prevTimePeriod, currTimePeriod) => {
            const timePeriodCode = currTimePeriod.timePeriodCode as TimePeriod;
            return {
              ...prevTimePeriod,
              [timePeriodCode]: currTimePeriod.performance,
            };
          },
          {} as Record<TimePeriod, number>
        );
      return { ...prevSecurity, [data?.security.id]: securityPerformance };
    },
    {} as Record<TradableSecurity["id"], Record<TimePeriod, number>>
  );
};
