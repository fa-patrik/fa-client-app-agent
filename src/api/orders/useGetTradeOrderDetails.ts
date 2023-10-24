import { gql, useQuery } from "@apollo/client";
import {
  TRADE_ORDERS_DETAILS,
  TRADE_ORDERS_EXTENDED_DETAILS,
} from "./fragments";
import { TradeOrderDetailsQuery } from "./types";

const TRADE_ORDER_QUERY_BY_ID = gql`
  ${TRADE_ORDERS_DETAILS}
  ${TRADE_ORDERS_EXTENDED_DETAILS}
  query GetTradeOrderById($orderId: Long, $filterTags: [String]) {
    order: transaction(id: $orderId) {
      ...TradeOrdersDetails
      ...TradeOrderExtendedDetails
    }
  }
`;

const documentTags: string[] = ["Online"];

export const useGetTradeOrderDetails = (orderId: string | undefined) => {
  const { loading, error, data } = useQuery<TradeOrderDetailsQuery>(
    TRADE_ORDER_QUERY_BY_ID,
    {
      variables: {
        orderId,
        filterTags: documentTags,
      },
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
    }
  );

  return { loading, error, data: data?.order };
};
