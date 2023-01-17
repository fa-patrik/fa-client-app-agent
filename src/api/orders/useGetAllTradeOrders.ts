import { gql, QueryHookOptions, useQuery } from "@apollo/client";
import { useGlobalDateRange } from "hooks/useGlobalDateRange";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { toShortISOString } from "utils/date";
import { TRADE_ORDERS_DETAILS } from "./fragments";
import { AllTradeOrdersQuery } from "./types";

export const TRADE_ORDERS_QUERY = gql`
  ${TRADE_ORDERS_DETAILS}
  query GetAllPortfoliosTradeOrders(
    $contactId: Long
    $startDate: String
    $endDate: String
  ) {
    contact(id: $contactId) {
      id
      tradeOrders(
        transactionStartDate: $startDate
        transactionEndDate: $endDate
      ) {
        ...TradeOrdersDetails
      }
    }
  }
`;

export const useGetAllTradeOrders = (options?: QueryHookOptions) => {
  const dateRangeProps = useGlobalDateRange();
  const { startDate, endDate } = dateRangeProps;

  const { linkedContact } = useKeycloak();
  const { selectedContactId } = useGetContractIdData();
  const { loading, error, data } = useQuery<AllTradeOrdersQuery>(
    TRADE_ORDERS_QUERY,
    {
      variables: {
        startDate: toShortISOString(startDate),
        endDate: toShortISOString(endDate),
        contactId: selectedContactId || linkedContact,
      },
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      ...options,
    }
  );

  return {
    loading,
    error,
    data: data?.contact.tradeOrders,
    ...dateRangeProps,
  };
};
