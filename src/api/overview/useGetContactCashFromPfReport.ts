import { gql, useQuery } from "@apollo/client";
import { useGetContractIdData } from "providers/ContractIdProvider";

const CONTACT_CASH_BALANCE_QUERY = gql`
  query GetContactCashBalanceFromPfReport($contactId: Long) {
    contact(id: $contactId) {
      id
      portfolioReport {
        accountBalance
      }
    }
  }
`;

export const useGetContactCashFromPfReport = (pollInterval?: number) => {
  const { selectedContactId } = useGetContractIdData();
  const { loading, error, data, refetch, networkStatus } = useQuery<{
    contact: {
      id: number;
      portfolioReport: {
        accountBalance: number;
      };
    };
  }>(CONTACT_CASH_BALANCE_QUERY, {
    variables: {
      contactId: selectedContactId,
    },
    pollInterval: pollInterval ?? undefined,
    notifyOnNetworkStatusChange: true,
  });

  return {
    loading,
    error,
    data: data?.contact?.portfolioReport?.accountBalance,
    refetch,
    networkStatus,
  };
};
