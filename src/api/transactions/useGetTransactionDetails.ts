import { gql, useQuery } from "@apollo/client";
import { TRANSACTION_DETAILS_FIELDS, TRANSACTION_FIELDS } from "./fragments";
import { TransactionDetailsQuery } from "./types";

export const TRANSACTION_DETAILS_QUERY = gql`
  ${TRANSACTION_FIELDS}
  ${TRANSACTION_DETAILS_FIELDS}
  query GetTransactionDetails($transactionId: Long, $filterTags: [String]) {
    transaction(id: $transactionId) {
      ...TransactionsFields
      ...TransactionDetailsFields
    }
  }
`;

const filterTags: string[] = ["Online"];

export const useGetTransactionDetails = (transactionId: string | undefined) => {
  const { loading, error, data } = useQuery<TransactionDetailsQuery>(
    TRANSACTION_DETAILS_QUERY,
    {
      variables: {
        transactionId,
        filterTags,
      },
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
    }
  );

  return { loading, error, data: data?.transaction };
};
