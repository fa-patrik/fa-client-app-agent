import { gql, useLazyQuery } from "@apollo/client";
import { TRADE_ORDERS_DETAILS } from "./fragments";
import { TradeOrderQuery } from "./types";

const TRADE_ORDER_QUERY = gql`
  ${TRADE_ORDERS_DETAILS}
  query GetTradeOrder($reference: String, $shortName: String) {
    tradeOrders(reference: $reference, shortName: $shortName) {
      ...TradeOrdersDetails
    }
  }
`;

export const useGetTradeOrder = () => {
  const [performQuery] = useLazyQuery<TradeOrderQuery>(TRADE_ORDER_QUERY, {
    fetchPolicy: "no-cache",
  });

  const getTradeOrderByRefAndShortname = async (
    reference: string,
    shortName: string
  ) => {
    const response = await performQuery({
      variables: {
        reference,
        shortName,
      },
    });
    return response.data?.tradeOrders?.[0];
  };

  return {
    getTradeOrderByRefAndShortname,
  };
};
