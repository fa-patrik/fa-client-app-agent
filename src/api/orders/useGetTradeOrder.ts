import { gql, useLazyQuery } from "@apollo/client";
import { TRADE_ORDERS_DETAILS } from "./fragments";
import { TradeOrderQuery } from "./types";

const TRADE_ORDER_QUERY = gql`
  ${TRADE_ORDERS_DETAILS}
  query GetTradeOrder(
    $reference: String,
    $shortName: String
  ) {
    tradeOrders(
      reference: $reference,
      shortName: $shortName
    ) {
      ...TradeOrdersDetails
    }
  }
`;

export const useGetTradeOrder = (
  reference?: string,
  portfolioShortName?: string
) => {

  const [getOrder, { loading, error, data, refetch }] = useLazyQuery<TradeOrderQuery>(
    TRADE_ORDER_QUERY,
    {
      variables: {
        reference,
        shortName: portfolioShortName
      },
      fetchPolicy: "no-cache",
    }
  );

  return {
    getOrder,
    loading,
    error,
    data: data?.tradeOrders,
    refetch
  };
};
