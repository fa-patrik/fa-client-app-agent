import { gql, useQuery } from "@apollo/client";
import type { SecurityDetailsQuery } from "./types";

const SECURITY_DETAILS_QUERY = gql`
  query GetSecurityDetails($securityId: Long, $documentTags: [String]) {
    security(id: $securityId) {
      id
      name
      namesAsMap
      securityCode
      isinCode
      url
      url2
      currency {
        securityCode
        amountDecimalCount
      }
      latestMarketData {
        id
        date: obsDate
        price: closeView
      }
      type {
        id
        code
        namesAsMap
        name
      }
      tagsAsSet
      documents(filterTags: $documentTags) {
        fileName
        identifier
        mimeType
      }
      groups {
        id
        code
        name
      }
      amountDecimalCount
    }
  }
`;

export const useGetSecurityDetails = (securityId: string | undefined) => {
  const { loading, error, data } = useQuery<SecurityDetailsQuery>(
    SECURITY_DETAILS_QUERY,
    {
      variables: {
        securityId: securityId,
        documentTags: ["Online"],
      },
      skip: !securityId,
    }
  );

  return {
    loading,
    error,
    data: data?.security,
  };
};
