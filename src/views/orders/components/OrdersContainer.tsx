import { useState, useEffect } from "react";
import { useApolloClient } from "@apollo/client";
import { useGetContactInfo } from "api/common/useGetContactInfo";
import { PORTFOLIO_QUERY } from "api/common/useGetPortfolioBasicFieldsById";
import { TradeOrder } from "api/orders/types";
import { useModal } from "components/Modal/useModal";
import {
  CancelOrderModalInitialData,
  CancelOrderModalContent,
} from "components/TradingModals/CancelOrderModalContent/CancelOrderModalContent";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import {
  isPortfolioAllowedToCancelOrder,
  isTradeOrderCancellable,
} from "services/permissions/cancelOrder";
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
  const { linkedContact } = useKeycloak();
  const { selectedContactId } = useGetContractIdData();
  const contactRepresentativeTags = useGetContactInfo(false, selectedContactId)
    ?.data?.representativeTags;
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
          isPortfolioAllowedToCancelOrder(
            contactRepresentativeTags,
            orderParentPortfolio,
            linkedContact
          ) &&
          isTradeOrderCancellable(order);
        if (cancellable) return setIsAnyOrderCancellable(true);
      }
      return setIsAnyOrderCancellable(false);
    };

    if (orders) checkOrdersCancellable(orders);
  }, [apolloClient, contactRepresentativeTags, linkedContact, orders]);

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
