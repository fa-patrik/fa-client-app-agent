import { OrderStatus } from "api/enums";
import { TransactionType } from "./enums";

export interface Transaction {
  id: number;
  amount: number;
  transactionDate: string;
  type: {
    typeCode: TransactionType;
    typeName: string;
    typeNamesAsMap: Record<string, string>;
    cashFlowEffect: number;
    amountEffect: number;
  };
  tradeAmountInPortfolioCurrency: number;
  securityName: string;
  parentPortfolio: {
    id: number;
  };
  reference: string;
  orderStatus: OrderStatus;
  extId?: string;
}

export interface PortfolioTransactionsQuery {
  portfolios: {
    id: number;
    transactions: Transaction[];
  }[];
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
  taxType: {
    namesAsMap: Record<string, string>;
    id: number;
  } | null;
  taxType2: {
    namesAsMap: Record<string, string>;
    id: number;
  } | null;
  tax: number;
  tax2: number;
}

export interface TransactionDetailsQuery {
  transaction: TransactionDetails;
}
