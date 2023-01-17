import { Portfolio } from "api/initial/useGetContactInfo";
import { ORDER_STATUS } from "../orders/enums";
type Values<T> = T[keyof T];
export type OrderStatus = Values<typeof ORDER_STATUS>;

export interface Transaction {
  id: number;
  amount: number;
  transactionDate: string;
  type: {
    typeName: string;
    typeNamesAsMap: Record<string, string>;
    cashFlowEffect: number;
    amountEffect: number;
  };
  tradeAmountInPortfolioCurrency: number;
  securityName: string;
  parentPortfolio: Portfolio;
  reference: string;
  orderStatus: OrderStatus;
  extId?: string;
}

export interface PortfolioTransactionsQuery {
  portfolio: {
    transactions: Transaction[];
  };
}

export interface AllPortfoliosTransactionsQuery {
  contact: {
    transactions: Transaction[];
  };
}

export interface TransactionDetails extends Transaction {
  security?: {
    id: number;
    isinCode: string;
    country?: {
      id: number;
      code: string;
    };
    exchange?: {
      name: string;
    };
  };
  settlementDate: string;
  unitPriceInSecurityCurrency: number;
  costInSecurityCurrency: number;
  accountFxRate: number;
  documents: {
    identifier: string;
  }[];
  extInfo: string;
  marketPlace?: {
    name: string;
  };
  account?: {
    currency: {
      accountCurrencyCode: string;
    };
  };
  orderStatus: OrderStatus;
  securityCurrencyCode: string;
  tradeAmountInAccountCurrency: number;
  tradeAmountInSecurityCurrency: number;
  grossPriceInSecurityCurrency: number;
  grossPriceInAccountCurrency: number;
  reference: string;
}

export interface TransactionDetailsQuery {
  transaction: TransactionDetails;
}
