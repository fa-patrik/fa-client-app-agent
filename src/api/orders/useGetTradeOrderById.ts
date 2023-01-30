import { gql, useLazyQuery } from "@apollo/client";
import { TRADE_ORDERS_DETAILS } from "./fragments";
import { TradeOrderQueryById } from "./types";

const TRADE_ORDER_QUERY_BY_ID = gql`
  ${TRADE_ORDERS_DETAILS}
  query GetTradeOrderById($orderId: Long) {
    transaction(id: $orderId) {
      ...TradeOrdersDetails
    }
  }
`;

export const useGetTradeOrderById = (orderId: number | undefined) => {
  const [getOrderById, { loading, error, data }] =
    useLazyQuery<TradeOrderQueryById>(TRADE_ORDER_QUERY_BY_ID, {
      variables: {
        orderId,
      },
      fetchPolicy: "no-cache",
    });

  return {
    getOrderById,
    loading,
    error,
    data: data?.transaction,
  };
};
