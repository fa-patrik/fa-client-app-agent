import { TransactionType } from "api/transactions/enums";
import { ORDER_STATUS } from "./enums";

type Values<T> = T[keyof T];
export type OrderStatus = Values<typeof ORDER_STATUS>;

export interface TradeOrderType {
  typeCode: TransactionType;
  typeName: string;
  typeNamesAsMap?: Record<string, string>;
  cashFlowEffect: number;
  amountEffect: number;
}

export interface TradeOrder {
  id: number;
  amount?: number;
  securityName: string;
  type: TradeOrderType;
  transactionDate: string;
  tradeAmountInPortfolioCurrency?: number;
  parentPortfolio: {
    id: number;
  };
  reference: string;
  orderStatus: OrderStatus;
  extId?: string;
}

export interface AllTradeOrdersQuery {
  contact: {
    id: number;
    tradeOrders: TradeOrder[];
  };
}

export interface PortfolioTradeOrdersQuery {
  portfolio: {
    id: number;
    tradeOrders: TradeOrder[];
  };
}

export interface TradeOrderQueryById {
  transaction: TradeOrder;
}

export interface TradeOrderQuery {
  tradeOrders: TradeOrder[];
}

interface OrderFromMutation {
  "o.maturityDate": string;
  "o.costType2": string;
  "o.origTransactionDate": string;
  "o.marketPlace": string;
  "o.counter": string;
  "o.extId": string;
  "o.unitPrice": string;
  "o.costType1": string;
  "o.accrual": string;
  "o.compCost2": string;
  "o.compCost1": string;
  "o.ratio": string;
  "o.description": string;
  "o.amount": string;
  "o.cost": string;
  "o.accountFxRate": string;
  "o.accruedInterest": string;
  "o.parentPortfolio": string;
  "o.basis": string;
  "o.securityType": string;
  "o.account": string;
  "o.origUnitPrice": string;
  "o.settlementDate": string;
  "o.status": string;
  "o.currency": string;
  "o.fxRate": string;
  importStatus: string;
  "o.reportFxRate": string;
  "o.prefix": string;
  "o.hidden": string;
  "o.security": string;
  "o.taxType2": string;
  "o.settlementPlace": string;
  "o.security2": string;
  "o.tradeTime": string;
  "o.priority": string;
  "o.transactionDate": string;
  "o.origFxRate": string;
  "o.type": string;
  "o.counterPortfolio": string;
  "o.tradeAmount": string;
  "o.intInfo": string;
  "o.paymentDate": string;
  "o.executionMethod": string;
  "o.taxType": string;
  "o.reference": string;
  "o.cost2": string;
  "o.coefficient": string;
}

export interface OrderMutationResponse {
  importTradeOrder:
    | [Record<string, string>, OrderFromMutation] //in case of success
    | [OrderFromMutation]; //in case of error
}
