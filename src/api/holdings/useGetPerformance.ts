import { gql, useQuery } from "@apollo/client";

const SECURITY_DETAILS_QUERY = gql`
  query GetSecurityPerformance($securityId: Long) {
    analytics(
      parameters: {
        secIds: [$securityId]
        paramsSet: {
          timePeriodCodes: ["YEARS-1", "YEARS-3", "YEARS-5"]
          key: "performance"
          includeData: true
          includeChildren: true
        }
      }
    ) {
      grouppedAnalytics(key: "performance") {
        grouppedAnalyticsTimePeriod {
          timePeriodCode
          performance: twr
        }
      }
    }
  }
`;

interface SecurityPerformanceQuery {
  analytics: {
    grouppedAnalytics: {
      grouppedAnalyticsTimePeriod: {
        timePeriodCode: string;
        performance: number;
      }[];
    };
  };
}

export const useGetPerformance = (securityId: string | undefined) => {
  const { loading, error, data } = useQuery<SecurityPerformanceQuery>(
    SECURITY_DETAILS_QUERY,
    {
      variables: {
        securityId: securityId,
      },
    }
  );

  return {
    loading,
    error,
    data: data?.analytics.grouppedAnalytics.grouppedAnalyticsTimePeriod,
  };
};
