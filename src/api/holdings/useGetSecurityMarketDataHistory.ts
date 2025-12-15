import { gql, useQuery } from "@apollo/client";
import type { SecurityMarketDataHistoryQuery } from "./types";

const SECURITY_DETAILS_QUERY = gql`
  query GetSecurityMarketDataHistory(
    $securityId: Long
    $timePeriodCode: String
  ) {
    security(id: $securityId) {
      id
      marketDataHistory(timePeriodCode: $timePeriodCode) {
        id
        price: closeView
        date: obsDate
      }
    }
  }
`;

export const useGetSecurityMarketDataHistory = (
  securityId: string | undefined,
  timePeriodCode: string
) => {
  const { loading, error, data } = useQuery<SecurityMarketDataHistoryQuery>(
    SECURITY_DETAILS_QUERY,
    {
      variables: {
        securityId,
        timePeriodCode,
      },
    }
  );

  return {
    loading,
    error,
    data: data?.security,
  };
};
