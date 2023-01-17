import { Portfolio } from "api/initial/useGetContactInfo";
import { depositType } from "api/money/useDeposit";
import { withdrawalType } from "api/money/useWithdrawal";
import { TradeOrder } from "api/orders/types";
import { TradeType as SecurityTradeType } from "api/trading/useTrade";
import {
  LocalTradeOrderId,
  LocalTradeOrderStatus,
} from "hooks/useLocalTradeStorageState";
import i18n from "i18next";
import { dateToYYYYMMDD } from "utils/date";
import { assertUnreachable } from "utils/type";
import { useLocalStorageStore } from "./useLocalStorageStore";

export type TradeType =
  | SecurityTradeType
  | typeof withdrawalType
  | typeof depositType;

const getOrderType = (type: TradeType) => {
  switch (type) {
    case "buy":
      return {
        typeName: i18n.t("ordersPage.buyStatus"),
        amountEffect: 1,
        cashFlowEffect: -1,
      };
    case "sell":
      return {
        typeName: i18n.t("ordersPage.sellStatus"),
        amountEffect: -1,
        cashFlowEffect: 1,
      };
    case "subscription":
      return {
        typeName: i18n.t("ordersPage.subscriptionStatus"),
        amountEffect: 1,
        cashFlowEffect: -1,
      };
    case "redemption":
      return {
        typeName: i18n.t("ordersPage.redemptionStatus"),
        amountEffect: -1,
        cashFlowEffect: 1,
      };
    case "withdrawal":
      return {
        typeName: i18n.t("ordersPage.withdrawStatus"),
        amountEffect: 0,
        cashFlowEffect: -1,
      };
    case "deposit":
      return {
        typeName: i18n.t("ordersPage.depositStatus"),
        amountEffect: 0,
        cashFlowEffect: 1,
      };
    default:
      assertUnreachable(type);
      return {
        typeName: "",
        amountEffect: 1,
        cashFlowEffect: -1,
      };
  }
};

export interface LocalTradeOrderDetails {
  portfolio: Portfolio;
  securityName: string;
  currency: string;
  tradeType: TradeType;
  reference: string;
  units?: number;
  tradeAmount?: number;
}

export const useLocalTradeStorageMutation = () => {
  const [orders, setOrders] = useLocalStorageStore();

  const placeOrder = async (order: TradeOrder) => {
    setOrders([...orders, order]);
  };

  return async (tradeDetails: LocalTradeOrderDetails) => {
    const {
      portfolio,
      securityName,
      tradeAmount,
      units,
      currency,
      tradeType,
      reference,
    } = tradeDetails;
    await placeOrder({
      id: LocalTradeOrderId,
      orderStatus: LocalTradeOrderStatus,
      securityName: securityName,
      type: getOrderType(tradeType),
      transactionDate: dateToYYYYMMDD(new Date()),
      tradeAmountInPortfolioCurrency: tradeAmount,
      amount: units,
      parentPortfolio: {
        id: portfolio.id,
        status: portfolio.status,
        shortName: portfolio.shortName,
        name: portfolio.name,
        currency: { securityCode: currency },
        portfolioGroups: portfolio.portfolioGroups,
      },
      reference,
    });
  };
};
