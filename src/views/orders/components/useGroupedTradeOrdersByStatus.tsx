import { useMemo } from "react";
import { OrderStatus } from "api/enums";
import type { TradeOrder } from "api/orders/types";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { assertUnreachable } from "../../../utils/type";

const OrderStatusesToDisplay = [
  OrderStatus.Pending,
  OrderStatus.Open,
  OrderStatus.Accepted,
  OrderStatus["In execution"],
  OrderStatus.Cancelled,
] as const;

type OrderStatusToDisplayType = (typeof OrderStatusesToDisplay)[number];

export const isOrderStatusToDisplayType = (
  status: string
): status is OrderStatusToDisplayType => {
  return (OrderStatusesToDisplay as readonly string[]).includes(status);
};

const getOrderStatusLabelKey = (orderStatus: OrderStatusToDisplayType) => {
  switch (orderStatus) {
    case OrderStatus.Pending: {
      return "ordersPage.pending";
    }
    case OrderStatus.Open: {
      return "ordersPage.open";
    }
    case OrderStatus["In execution"]: {
      return "ordersPage.inExecution";
    }
    case OrderStatus.Accepted: {
      return "ordersPage.accepted";
    }
    case OrderStatus.Cancelled: {
      return "ordersPage.cancelled";
    }
    default: {
      assertUnreachable(orderStatus);
      return "";
    }
  }
};

export interface TradeOrdersGroup {
  type: OrderStatus;
  label: string;
  tradeOrders: TradeOrder[];
}

export const useGroupedTradeOrdersByStatus = (
  tradeOrders: TradeOrder[] | undefined
) => {
  const { t } = useModifiedTranslation();
  return useMemo(() => {
    const grouped: TradeOrdersGroup[] = [];
    OrderStatusesToDisplay.forEach((orderStatus) => {
      grouped.push({
        type: orderStatus,
        label: t(getOrderStatusLabelKey(orderStatus)),
        tradeOrders: [],
      });
    });

    tradeOrders?.forEach((tradeOrder) => {
      const orderStatus = tradeOrder.orderStatus;

      if (isOrderStatusToDisplayType(orderStatus)) {
        const indexOfGrouped = grouped.findIndex(
          (group) => group.type === orderStatus
        );

        grouped[indexOfGrouped].tradeOrders.push(tradeOrder);
      }
    });
    return grouped;
  }, [tradeOrders, t]);
};
