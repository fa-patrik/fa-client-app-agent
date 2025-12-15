import { TransactionTypeAmountEffect, OrderStatus } from "api/enums";
import { isOrderStatusToDisplayType } from "views/orders/components/useGroupedTradeOrdersByStatus";
import { getBackendTranslation } from "./backTranslations";
import type { TradeOrder } from "../api/orders/types";

export enum PartOfSwitch {
  BUY = "buy",
  SELL = "sell",
  NONE = "none",
}

export const switchStatusToDisplay = (fromOrder: TradeOrder | undefined) => {
  if (
    fromOrder?.orderStatus &&
    isOrderStatusToDisplayType(fromOrder?.orderStatus)
  ) {
    return fromOrder?.orderStatus;
  } else {
    return OrderStatus["In execution"];
  }
};

export const isOrderPartOfSwitch = (order: TradeOrder) => {
  return getPartOfSwitch(order) !== PartOfSwitch.NONE;
};

export const getSwitchDetails = (order: TradeOrder) => {
  if (isOrderPartOfSwitch(order)) {
    const fromOrder =
      order.type.amountEffect === TransactionTypeAmountEffect.Decreasing
        ? order
        : (order.linkedTransaction ?? undefined);

    const toOrder =
      order.type.amountEffect === TransactionTypeAmountEffect.Increasing
        ? order
        : (order.linkedTransaction ?? undefined);

    const switchOrderStatus = switchStatusToDisplay(fromOrder);

    return { fromOrder, toOrder, switchOrderStatus };
  }
};

/* In FA Switches, sell legs are linked to buys, but buy legs are not linked to their
 * sell counterpart. Here we figure out the sell leg that is connected
 * to a buy, and add the missing linkage.
 */
export const linkSwitchBuyLegsToSells = (orders: TradeOrder[] | undefined) => {
  if (!orders) return;

  //convert to map for faster indexing
  const ordersAsMap = orders?.reduce(
    (prev, curr) => {
      prev[curr.id] = curr;
      return prev;
    },
    {} as Record<TradeOrder["id"], TradeOrder>
  );

  //add the linkage
  for (const order of orders) {
    if (
      order.linkedTransaction &&
      getPartOfSwitch(order) === PartOfSwitch.SELL
    ) {
      //if sell leg, get it's linked transaction (the buy leg)
      //and link the sell to the buy
      if (order.linkedTransaction.id in ordersAsMap) {
        ordersAsMap[order.linkedTransaction.id] = {
          ...ordersAsMap[order.linkedTransaction.id],
          linkedTransaction: order,
        };
      }
    }
  }

  return Object.values(ordersAsMap);
};

export const getPartOfSwitch = (order: TradeOrder): PartOfSwitch => {
  if (
    order.type.amountEffect === TransactionTypeAmountEffect.Increasing &&
    order?.linkedTransaction?.type.amountEffect ===
      TransactionTypeAmountEffect.Decreasing
  ) {
    return PartOfSwitch.BUY;
  } else if (
    order.type.amountEffect === TransactionTypeAmountEffect.Decreasing &&
    order?.linkedTransaction?.type.amountEffect ===
      TransactionTypeAmountEffect.Increasing
  ) {
    return PartOfSwitch.SELL;
  }

  return PartOfSwitch.NONE;
};

export const getOrderTypeName = (
  order: TradeOrder,
  t: (key: string, options?: Record<string, unknown>) => string,
  locale: string | undefined,
  resolvedLanguage: string | undefined
): string => {
  const typeName = isOrderPartOfSwitch(order)
    ? t("utils.switchOrder.typeName")
    : getBackendTranslation(
        order?.type?.typeName,
        order?.type?.typeNamesAsMap,
        locale,
        resolvedLanguage
      );
  return typeName;
};
