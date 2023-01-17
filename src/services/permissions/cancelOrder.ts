import { Portfolio } from "api/initial/useGetContactInfo";
import { ORDER_STATUS } from "api/orders/enums";
import { TradeOrder } from "api/orders/types";
import { OrderStatus } from "api/transactions/types";

export const CancelOrderPermissionGroup = "CP_CANCEL" as const;

export const isPortfolioAllowedToCancelOrder = (portfolio: Portfolio) => {
    if (!portfolio.portfolioGroups) return false
    return portfolio.portfolioGroups.some(
        (group) => group.code === CancelOrderPermissionGroup
    );
}

export const isTradeOrderCancellable = (tradeOrder: TradeOrder) => {
    return (
        tradeOrder?.orderStatus === ORDER_STATUS.Accepted ||
        tradeOrder?.orderStatus === ORDER_STATUS.Pending ||
        tradeOrder?.orderStatus === ORDER_STATUS.Open
    )
}

export const isStatusCancellable = (orderStatus: OrderStatus) => {
    return (
        orderStatus === ORDER_STATUS.Accepted ||
        orderStatus === ORDER_STATUS.Pending ||
        orderStatus === ORDER_STATUS.Open
    )
}

export const isTradeOrderCancelled = (tradeOrder: TradeOrder) => {
    return (
        tradeOrder?.orderStatus === ORDER_STATUS.Cancelled
    )
}