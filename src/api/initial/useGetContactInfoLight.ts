import { useMemo } from "react";
import { gql, useQuery } from "@apollo/client";
import { fallbackLanguage } from "i18n";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import {
  Portfolio,
  PORTFOLIO_BASIC_FIELDS,
  removeClosed,
} from "./useGetContactInfo";

//maximum of 2 sub portfolio depth
export const CONTACT_INFO_LITE_QUERY = gql`
  ${PORTFOLIO_BASIC_FIELDS}
  query GetContactInfoLite($contactId: Long) {
    contact(id: $contactId) {
      id
      contactId
      name
      language {
        locale
      }
      portfolios {
        ...PortfolioBasicFields
      }
    }
  }
`;

interface ContactInfoLiteQuery {
  contact?: {
    id: number;
    contactId: string;
    name: string;
    language: {
      locale: string;
    };
    portfolios?: Portfolio[];
  };
}

export const useGetContactInfoLight = (callAPI = false) => {
  const { linkedContact } = useKeycloak();
  const { selectedContactId } = useGetContractIdData();
  const { loading, error, data, refetch } = useQuery<ContactInfoLiteQuery>(
    CONTACT_INFO_LITE_QUERY,
    {
      variables: {
        contactId: selectedContactId || linkedContact?.toString(),
      },
      fetchPolicy: callAPI ? "cache-and-network" : "cache-first",
    }
  );
  const activeAndPassivePortfolios = useMemo(
    () =>
      !data?.contact?.portfolios?.length
        ? []
        : removeClosed(data?.contact?.portfolios),
    [data?.contact?.portfolios]
  );

  return {
    loading: loading,
    error: error,
    data: data && {
      contactId: data.contact?.id,
      _contactId: data.contact?.contactId,
      portfolios: activeAndPassivePortfolios,
      locale: data.contact?.language?.locale || fallbackLanguage,
      portfoliosCurrency:
        data.contact?.portfolios?.[0]?.currency.securityCode || "",
      name: data.contact?.name,
    },
    refetch,
  };
};
