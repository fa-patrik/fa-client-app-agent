import { gql, useQuery } from "@apollo/client";
import { getFetchPolicyOptions } from "api/utils";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { SUMMARY_FIELDS, PORTFOLIO_FIELDS } from "./fragments";
import { AllPortfoliosQuery } from "./types";

const CONTACT_QUERY = gql`
  ${SUMMARY_FIELDS}
  ${PORTFOLIO_FIELDS}
  query GetContact($contactId: Long) {
    contact(id: $contactId) {
      id
      ...SummaryFields
      portfolios {
        ...PortfolioFields
      }
    }
  }
`;

export const useGetAllPortfolios = () => {
  const { linkedContact } = useKeycloak();
  const { selectedContactId } = useGetContractIdData();
  const { loading, error, data } = useQuery<AllPortfoliosQuery>(CONTACT_QUERY, {
    variables: {
      contactId: selectedContactId || linkedContact,
    },
    ...getFetchPolicyOptions(
      `useGetAllPortfolios.${selectedContactId || linkedContact}`
    ),
  });

  return { loading, error, data: data?.contact };
};
