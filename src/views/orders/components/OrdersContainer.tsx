import { TradeOrder } from "api/orders/types";
import { useModal } from "components/Modal/useModal";
import {
  CancelOrderModalInitialData,
  CancelOrderModalContent,
} from "components/TradingModals/CancelOrderModalContent/CancelOrderModalContent";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { isPortfolioAllowedToCancelOrder, isTradeOrderCancellable } from "services/permissions/cancelOrder"
import { NoOrders } from "./NoOrders";
import { OrdersGroup } from "./OrdersGroup"
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

  const groupedTradeOrders = useGroupedTradeOrdersByStatus(orders);
  if (!orders || orders.length === 0) {
    return <NoOrders startDate={startDate} endDate={endDate} />;
  }

  const isAnyOrderCancellable = orders.some(order => (
    isPortfolioAllowedToCancelOrder(order.parentPortfolio) &&
    isTradeOrderCancellable(order)
  ))



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
