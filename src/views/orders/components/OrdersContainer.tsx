import { useState, useEffect } from "react";
import { useApolloClient } from "@apollo/client";
import { PORTFOLIO_QUERY } from "api/generic/useGetPortfolioBasicFieldsById";
import { TradeOrder } from "api/orders/types";
import { useModal } from "components/Modal/useModal";
import {
  CancelOrderModalInitialData,
  CancelOrderModalContent,
} from "components/TradingModals/CancelOrderModalContent/CancelOrderModalContent";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import {
  isPortfolioAllowedToCancelOrder,
  isTradeOrderCancellable,
} from "services/permissions/cancelOrder";
import { NoOrders } from "./NoOrders";
import { OrdersGroup } from "./OrdersGroup";
import { useGroupedTradeOrdersByStatus } from "./useGroupedTradeOrdersByStatus";

interface OrdersContainerProps {
  data: {
    startDate: Date;
    endDate: Date;
    orders: TradeOrder[] | undefined;
  };
}

export const OrdersContainer = ({
  data: { startDate, endDate, orders },
}: OrdersContainerProps) => {
  const {
    Modal,
    onOpen: onCancelOrderModalOpen,
    modalProps: cancelOrderModalProps,
    contentProps: cancelOrderModalContentProps,
  } = useModal<CancelOrderModalInitialData>();

  const { t } = useModifiedTranslation();
  const [isAnyOrderCancellable, setIsAnyOrderCancellable] = useState(false);
  const apolloClient = useApolloClient();

  useEffect(() => {
    //run a check to see if any trade order is cancellable
    //this info is used by tables to decide whether
    //to render a last column for cancelling orders
    const checkOrdersCancellable = async (orders: TradeOrder[]) => {
      for (const order of orders) {
        //will only query FA on cache-miss
        const response = await apolloClient.query({
          fetchPolicy: "cache-first",
          query: PORTFOLIO_QUERY,
          variables: { portfolioId: order.parentPortfolio.id },
        });
        const orderParentPortfolio = response?.data?.portfolio;
        const cancellable =
          orderParentPortfolio &&
          isPortfolioAllowedToCancelOrder(orderParentPortfolio) &&
          isTradeOrderCancellable(order);
        if (cancellable) return setIsAnyOrderCancellable(true);
      }
      return setIsAnyOrderCancellable(false);
    };

    if (orders) checkOrdersCancellable(orders);
  }, [apolloClient, orders]);

  const groupedTradeOrders = useGroupedTradeOrdersByStatus(orders);
  if (!orders || orders.length === 0) {
    return <NoOrders startDate={startDate} endDate={endDate} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {groupedTradeOrders.map(
        (group) =>
          group.tradeOrders.length > 0 && (
            <OrdersGroup
              isAnyOrderCancellable={isAnyOrderCancellable}
              key={group.type}
              label={group.label}
              orders={group.tradeOrders}
              type="order"
              onCancelOrderModalOpen={onCancelOrderModalOpen}
            />
          )
      )}
      <Modal {...cancelOrderModalProps} header={t("cancelOrderModal.header")}>
        <CancelOrderModalContent {...cancelOrderModalContentProps} />
      </Modal>
    </div>
  );
};
