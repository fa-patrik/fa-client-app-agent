import type { QueryHookOptions } from "@apollo/client";
import { gql, useQuery } from "@apollo/client";
import { useGlobalDateRange } from "hooks/useGlobalDateRange";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { toShortISOString } from "utils/date";
import { TRANSACTION_FIELDS } from "./fragments";
import type { AllPortfoliosTransactionsQuery } from "./types";

const TRANSACTIONS_QUERY = gql`
  ${TRANSACTION_FIELDS}
  query GetAllPortfoliosTransactions(
    $startDate: String
    $endDate: String
    $contactId: Long
  ) {
    contact(id: $contactId) {
      id
      transactions(startDate: $startDate, endDate: $endDate) {
        ...TransactionsFields
      }
    }
  }
`;

export const useGetAllPortfoliosTransactions = (options?: QueryHookOptions) => {
  const { linkedContact } = useKeycloak();
  const { selectedContactId } = useGetContractIdData();
  const dateRangeProps = useGlobalDateRange();
  const { startDate, endDate } = dateRangeProps;

  const { loading, error, data } = useQuery<AllPortfoliosTransactionsQuery>(
    TRANSACTIONS_QUERY,
    {
      variables: {
        startDate: toShortISOString(startDate),
        endDate: toShortISOString(endDate),
        contactId: selectedContactId || linkedContact,
      },
      fetchPolicy: "cache-and-network",
      ...options,
    }
  );

  return {
    loading,
    error,
    data: data?.contact.transactions,
    ...dateRangeProps,
  };
};
