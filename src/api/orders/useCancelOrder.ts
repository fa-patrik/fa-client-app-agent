import { gql, useMutation, useApolloClient } from "@apollo/client";
import { useGetPortfolioBasicFieldsById } from "api/generic/useGetPortfolioBasicFieldsById";
import { OrderMutationResponse } from "api/orders/types";
import { TRADE_ORDERS_QUERY } from "api/orders/useGetAllTradeOrders";
import { useGetTradeOrder } from "api/orders/useGetTradeOrder";
import { useGetTradeOrderById } from "api/orders/useGetTradeOrderById";
import { OrderStatus } from "api/transactions/types";
import { TRANSACTION_DETAILS_QUERY } from "api/transactions/useGetTransactionDetails";
import { useLocalStorageStore } from "hooks/useLocalStorageStore";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { toast } from "react-toastify";
import {
  isPortfolioAllowedToCancelOrder,
  isTradeOrderCancellable,
} from "services/permissions/cancelOrder";
import { ORDER_STATUS } from "./enums";

const CANCEL_ORDER_MUTATION = gql`
  mutation cancelOrder($portfolioShortName: String, $extId: String, $reference: String) {
    importTradeOrder(
      tradeOrder: {
        parentPortfolio: $portfolioShortName, 
        extId: $extId,
        reference: $reference,
        status:"${ORDER_STATUS.Cancelled}"
      }
    )
  }
`;

interface CancelOrderQueryProps {
  orderId: number;
  reference: string;
  portfolioId: number;
}

interface CancelOrderQueryVariables {
  extId?: string;
  reference: string;
  portfolioShortName: string;
}

export const useCancelOrder = (cancelledTradeOrder: CancelOrderQueryProps) => {
  const { t } = useModifiedTranslation();

  const [cancelOrderInFA] = useMutation<
    OrderMutationResponse,
    CancelOrderQueryVariables
  >(CANCEL_ORDER_MUTATION, {
    update(cache, { data }) {
      cache.modify({
        id: `Transaction:${orderId}`, //id is not returned from order mutation
        fields: {
          orderStatus(cachedStatus: OrderStatus) {
            //find the element with the mutation return data
            const mutationResponseData = data?.importTradeOrder?.find(
              (element) => element["o.status"]
            );

            if (
              mutationResponseData?.importStatus === "ERROR" ||
              mutationResponseData?.["o.status"] !== "3"
            ) {
              throw new Error("Order was not cancelled.");
            }

            return mutationResponseData?.["o.status"];
          },
        },
        broadcast: false, //prevent automatic query refresh
      });
    },
  });

  const { orderId, reference, portfolioId } = cancelledTradeOrder;

  const { getOrderById } = useGetTradeOrderById(orderId);
  const { getTradeOrderByRefAndShortname } = useGetTradeOrder();

  const [orders, setOrders] = useLocalStorageStore();
  const apolloClient = useApolloClient();
  const { data: orderParentPortfolio } =
    useGetPortfolioBasicFieldsById(portfolioId);
  const handleOrderCancel = async () => {
    try {
      if (!orderParentPortfolio)
        throw new Error(
          "Unable to cancel FA trade order. Could not find parent portfolio."
        );

      const isLocalOrder = orderId === -1;
      let faVersionOfTradeOrder = null;
      let localVersionOfTradeOrder = null;

      if (isLocalOrder) {
        //we know it exists in the local tradingStorage
        //it's possible it has been mutated in FA too
        //attempt to get latest details about it
        faVersionOfTradeOrder = await getTradeOrderByRefAndShortname(
          reference,
          orderParentPortfolio.shortName
        );

        //get the version of the order contained in the browser's local storage "tradingStorage"
        //this is a separate 'cache' where Pending orders are kept (that have not been verified as created in FA yet)
        localVersionOfTradeOrder =
          reference && orders.find((order) => order.reference === reference);
      } else {
        //we know it existed only in FA (because we have an id other than -1)
        const faResponse = await getOrderById();
        faVersionOfTradeOrder = faResponse.data?.transaction;
      }

      /**
       * 1: Order only in FA.
       * 2: Order both in FA and browser's local tradingStorage.
       * 3: Order only in browser's local tradingStorage.
       * 4: Order does not exist in either FA or local tradingStorage.
       */
      const scenario =
        faVersionOfTradeOrder && !localVersionOfTradeOrder
          ? 1
          : faVersionOfTradeOrder && localVersionOfTradeOrder
          ? 2
          : !faVersionOfTradeOrder && localVersionOfTradeOrder
          ? 3
          : 4;

      switch (scenario) {
        case 1:
          if (
            faVersionOfTradeOrder &&
            isTradeOrderCancellable(faVersionOfTradeOrder) &&
            isPortfolioAllowedToCancelOrder(orderParentPortfolio)
          ) {
            await cancelOrderInFA({
              variables: {
                extId: faVersionOfTradeOrder.extId,
                reference: faVersionOfTradeOrder.reference,
                portfolioShortName: orderParentPortfolio.shortName,
              },
            });
          } else {
            throw new Error("Unable to cancel FA trade order.");
          }
          break;
        case 2:
          if (
            faVersionOfTradeOrder &&
            localVersionOfTradeOrder &&
            isTradeOrderCancellable(faVersionOfTradeOrder) &&
            isPortfolioAllowedToCancelOrder(orderParentPortfolio)
          ) {
            await cancelOrderInFA({
              variables: {
                extId: faVersionOfTradeOrder.extId,
                reference: faVersionOfTradeOrder.reference,
                portfolioShortName: orderParentPortfolio.shortName,
              },
            });
            //update orderStatus in the tradingStorage
            localVersionOfTradeOrder.orderStatus = ORDER_STATUS.Cancelled;
            const filteredOrders = orders.filter(
              (order) => order.reference !== reference
            );
            setOrders([...filteredOrders, localVersionOfTradeOrder]);
          } else {
            throw new Error("Unable to cancel FA trade order.");
          }
          break;
        case 3:
          if (
            localVersionOfTradeOrder &&
            isTradeOrderCancellable(localVersionOfTradeOrder) &&
            isPortfolioAllowedToCancelOrder(orderParentPortfolio)
          ) {
            await cancelOrderInFA({
              variables: {
                reference: localVersionOfTradeOrder.reference,
                portfolioShortName: orderParentPortfolio.shortName,
              },
            });
            //update its orderStatus in the tradingStorage
            localVersionOfTradeOrder.orderStatus = ORDER_STATUS.Cancelled;
            const filteredOrders = orders.filter(
              (order) => order.reference !== reference
            );
            setOrders([...filteredOrders, localVersionOfTradeOrder]);
          } else {
            throw new Error("Unable to cancel local trade order.");
          }
          break;
        case 4:
          throw new Error(
            "Unable to cancel trade order. It was not found in FA or local tradingStorage."
          );
      }

      toast.success(t("messages.orderCancelSuccess"), { autoClose: 3000 });
    } catch (e: unknown) {
      toast.error(t("messages.orderCancelFailed"));
      await apolloClient.refetchQueries({
        include: [TRADE_ORDERS_QUERY, TRANSACTION_DETAILS_QUERY],
      });
    }
  };

  return { handleOrderCancel };
};
