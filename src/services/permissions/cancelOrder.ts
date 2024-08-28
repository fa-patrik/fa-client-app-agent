import {
  Portfolio,
  PortfolioGroups,
  RepresentativeTag,
} from "api/common/useGetContactInfo";
import { OrderStatus } from "api/enums";
import { TradeOrder } from "api/orders/types";
import { TransactionType } from "api/transactions/enums";
import { isPortfolioEligible } from "./common";

const CANCELLABLE_TRANSACTION_TYPES = [
  TransactionType.BUY,
  TransactionType.SELL,
  TransactionType.REDEMPTION,
  TransactionType.SUBSCRIPTION,
] as TransactionType[];

const CANCELLABLE_STATUSES = [
  OrderStatus.Accepted,
  OrderStatus.Pending,
  OrderStatus.Open,
] as OrderStatus[];

export const isPortfolioAllowedToCancelOrder = (
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  portfolio: Portfolio,
  linkedContact: string | undefined
) => {
  return isPortfolioEligible(
    contactRepresentativeTags,
    portfolio,
    linkedContact,
    PortfolioGroups.CANCEL_ORDER,
    RepresentativeTag.CANCEL_ORDER
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
  return tradeOrder?.orderStatus === OrderStatus.Cancelled;
};
