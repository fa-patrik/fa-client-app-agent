import { Portfolio } from "api/initial/useGetContactInfo";
import { ORDER_STATUS } from "api/orders/enums";
import { TradeOrder } from "api/orders/types";
import { TransactionType } from "api/transactions/enums";
import { OrderStatus } from "api/transactions/types";

const CANCELLABLE_TRANSACTION_TYPES = [
  TransactionType.BUY,
  TransactionType.SELL,
  TransactionType.REDEMPTION,
  TransactionType.SUBSCRIPTION,
] as TransactionType[];

const CANCELLABLE_STATUSES = [
  ORDER_STATUS.Accepted,
  ORDER_STATUS.Pending,
  ORDER_STATUS.Open,
] as OrderStatus[];

export const CancelOrderPermissionGroup = "CP_CANCEL" as const;

export const isPortfolioAllowedToCancelOrder = (portfolio: Portfolio) => {
  if (!portfolio.portfolioGroups) return false;
  return portfolio.portfolioGroups.some(
    (group) => group.code === CancelOrderPermissionGroup
  );
};

export const isTradeOrderCancellable = (tradeOrder: TradeOrder) => {
  const orderStatus = tradeOrder.orderStatus as OrderStatus;
  const orderTransactionTypeCode = tradeOrder.type.typeCode as TransactionType;
  const isOrderStatusCancellable = isStatusCancellable(orderStatus);
  const isOrderTransactionTypeCancellable = isTransactionTypeCancellable(
    orderTransactionTypeCode
  );
  return isOrderStatusCancellable && isOrderTransactionTypeCancellable;
};

export const isStatusCancellable = (orderStatus: OrderStatus) => {
  return CANCELLABLE_STATUSES.includes(orderStatus);
};

export const isTransactionTypeCancellable = (typeCode: TransactionType) => {
  return CANCELLABLE_TRANSACTION_TYPES.includes(typeCode);
};

export const isTradeOrderCancelled = (tradeOrder: TradeOrder) => {
    return (
        tradeOrder?.orderStatus === ORDER_STATUS.Cancelled
    )
}