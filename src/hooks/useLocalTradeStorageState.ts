// when user place order (buy/sell security/cash) we keep that order in local storage until backend handle it

import { useEffect, useMemo } from "react";
import { TradeOrder } from "api/orders/types";
import { dateFromYYYYMMDD, isDateInRange } from "utils/date";
import { useGetAllTradeOrders } from "../api/orders/useGetAllTradeOrders";
import { useGetPortfolioTradeOrders } from "../api/orders/useGetPortfolioTradeOrders";
import { useGetAllPortfoliosTransactions } from "../api/transactions/useGetAllPortfoliosTransactions";
import { useGetPortfolioTransactions } from "../api/transactions/useGetPortfolioTransactions";
import { useLocalStorageStore } from "./useLocalStorageStore";

export type LocalOrder = TradeOrder;

export const isLocalOrder = (
  order: TradeOrder
) => {
  return order.id === LocalTradeOrderId;
};

export const LocalTradeOrderId = -1;
export const LocalTradeOrderStatus = "-1";

export const useLocalTradeStorageState = (
  portfolioId?: string,
  startDate?: Date,
  endDate?: Date
) => {
  const [orders, setOrders] = useLocalStorageStore();

  const { transactions: apiTransactions, tradeOrders: apiTradeOrders } =
    useGetTradeOrdersAndTransactions(portfolioId);

  useEffect(() => {
    // check API if some orders are already handled and if they are, remove them from local storage
    let storageChanged = false;

    const filteredOrders = orders.filter((order) => {
      const isHandled =
        apiTransactions.some(
          (transaction) => transaction.reference === order.reference
        ) ||
        apiTradeOrders.some(
          (tradeOrder) => tradeOrder.reference === order.reference
        );
      if (isHandled) {
        storageChanged = true;
        return false;
      }
      return true;
    });
    if (storageChanged) {
      setOrders(filteredOrders);
    }
  }, [apiTransactions, apiTradeOrders, orders, setOrders]);

  const ordersInRange = orders.filter((order) => {
    if (portfolioId && order.parentPortfolio.id !== parseInt(portfolioId)) {
      return false;
    }
    const orderDate = dateFromYYYYMMDD(order.transactionDate);
    return isDateInRange(orderDate, startDate, endDate);
  });

  return { orders: ordersInRange };
};

// startDate and endDate is not needed because we use global storage in useGetAllTradeOrders and useGetPortfolioTradeOrders
// without date range global storage we need pass those dates to useGetAllTradeOrders and useGetPortfolioTradeOrders
const useGetTradeOrdersAndTransactions = (portfolioId?: string) => {
  const { data: allPortfoliosTradeOrders = [] } = useGetAllTradeOrders({
    fetchPolicy: "cache-first",
    skip: !!portfolioId,
  });
  const { data: portfolioTradeOrders = [] } = useGetPortfolioTradeOrders(
    portfolioId,
    {
      fetchPolicy: "cache-first",
      skip: !portfolioId,
    }
  );
  const { data: allPortfoliosTransactions = [] } =
    useGetAllPortfoliosTransactions({
      fetchPolicy: "cache-first",
      skip: !!portfolioId,
    });
  const { data: portfolioTransactions = [] } = useGetPortfolioTransactions(
    portfolioId,
    {
      fetchPolicy: "cache-first",
      skip: !portfolioId,
    }
  );

  return {
    tradeOrders: useMemo(
      () => [...allPortfoliosTradeOrders, ...portfolioTradeOrders],
      [allPortfoliosTradeOrders, portfolioTradeOrders]
    ),
    transactions: useMemo(
      () => [...allPortfoliosTransactions, ...portfolioTransactions],
      [allPortfoliosTransactions, portfolioTransactions]
    ),
  };
};
