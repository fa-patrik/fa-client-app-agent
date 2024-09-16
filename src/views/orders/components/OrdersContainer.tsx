import { useState, useEffect } from "react";
import { useApolloClient } from "@apollo/client";
import {
  PortfolioGroups,
  RepresentativeTag,
} from "api/common/useGetContactInfo";
import { PORTFOLIO_QUERY } from "api/common/useGetPortfolioBasicFieldsById";
import { TradeOrder } from "api/orders/types";
import { useModal } from "components/Modal/useModal";
import {
  CancelOrderModalInitialData,
  CancelOrderModalContent,
} from "components/TradingModals/CancelOrderModalContent/CancelOrderModalContent";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { isTradeOrderCancellable } from "services/permissions/cancelOrder";
import { PermissionMode, useFeature } from "services/permissions/usePermission";
import { NoOrders } from "./NoOrders";
import { OrderCardList } from "./OrderCardList";
import { OrdersListWithOneLineRow } from "./OrdersListWithOneLineRow";

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

  const { canPf: canPfCancelOrder } = useFeature(
    PortfolioGroups.CANCEL_ORDER,
    RepresentativeTag.CANCEL_ORDER,
    PermissionMode.SELECTED
  );

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
          canPfCancelOrder(orderParentPortfolio) &&
          isTradeOrderCancellable(order);
        if (cancellable) return setIsAnyOrderCancellable(true);
      }
      return setIsAnyOrderCancellable(false);
    };

    if (orders) checkOrdersCancellable(orders);
  }, [apolloClient, canPfCancelOrder, orders]);

  const hasOneLineRow = useMatchesBreakpoint("md");

  const OrdersList = hasOneLineRow ? OrdersListWithOneLineRow : OrderCardList;

  if (!orders || orders.length === 0) {
    return <NoOrders startDate={startDate} endDate={endDate} />;
  }

  return (
    <div>
      <OrdersList
        orders={orders}
        isAnyOrderCancellable={isAnyOrderCancellable}
        onCancelOrderModalOpen={onCancelOrderModalOpen}
      />

      <Modal {...cancelOrderModalProps} header={t("cancelOrderModal.header")}>
        <CancelOrderModalContent {...cancelOrderModalContentProps} />
      </Modal>
    </div>
  );
};
