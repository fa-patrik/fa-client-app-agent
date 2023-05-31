import { gql, useQuery } from "@apollo/client";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useGetContactInfo } from "../initial/useGetContactInfo";
import { SecurityDetailsQuery } from "./types";

const SECURITY_DETAILS_QUERY = gql`
  query GetSecurityDetails($securityId: Long, $currency: String, $filterTags: [String]) {
    security(id: $securityId) {
      id
      name
      securityCode
      isinCode
      url
      url2
      currency {
        securityCode
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
      fxRate(quoteCurrency: $currency)
      tagsAsSet
      documents(filterTags: $filterTags) {
        fileName
        identifier
        mimeType
      }
    }
  }
`;

export const useGetSecurityDetails = (securityId: string | undefined) => {
  const { selectedContactId } = useGetContractIdData();
  const { data: { portfoliosCurrency } = { portfoliosCurrency: "EUR" } } =
    useGetContactInfo(false, selectedContactId);
  const { loading, error, data } = useQuery<SecurityDetailsQuery>(
    SECURITY_DETAILS_QUERY,
    {
      variables: {
        securityId: securityId,
        currency: portfoliosCurrency,
        filterTags: "Online",
      },
    }
  );

  return {
    loading,
    error,
    data: data?.security,
  };
};
