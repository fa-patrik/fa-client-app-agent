import { ApolloError } from "@apollo/client";
import { ExecutionMethod, OrderStatus } from "./enums";

export interface QueryData<TData> {
  loading: boolean;
  error: ApolloError | undefined;
  data: TData | undefined;
}

/**
 * A limited version of the trade order type.
 */
export interface LimitedTradeOrderDTO {
  account: string;
  amount: string;
  currency: string;
  exceutionMethod: string;
  extId: string;
  fxRate: string;
  parentPortfolio: string;
  prefix: string;
  reference: string;
  security: string;
  settlementDate: string;
  status: string;
  tradeAmount: string;
  transactionDate: string;
  type: string;
  unitPrice: string;
}

/**
 * The type expected by importTradeOrder endpoint (FA Back > 3.20).
 * One of amount and trade amount must be given.
 */
export interface LimitedTradeOrderDTOInput {
  /**
   * See o.account at https://documentation.fasolutions.com/en/file-formats-for-importing-transactions-and-trade-orders.html.
   */
  account?: string;
  amount?: number;
  /**
   * Security code of the currency.
   */
  currency?: string;
  executionMethod: ExecutionMethod;
  /**
   * Identifer of order. Auto-generated if not provided.
   */
  extId?: string;
  fxRate?: string;
  /**
   * Portfolio short name.
   */
  parentPortfolio: string;
  prefix?: string;
  /**
   * Alternative identifier of the order. Should be unique in the portfolio.
   */
  reference?: string;
  /**
   * Security code, ISIN, trade code or update codes 1 through 3. Omit for cash orders.
   */
  security?: string;
  settlementDate?: string;
  /**
   * Open or Cancelled order status.
   */
  status: OrderStatus.Open | OrderStatus.Cancelled;
  tradeAmount?: number;
  transactionDate: string;
  /**
   * Transaction type.
   */
  type: string;
  unitPrice?: number;
  /**
   * Whether to populate unitPrice with latest known price.
   */
  autoUnitPrice?: boolean;
  /**
   * Whether to populate fxRate with latest known fx rate.
   */
  autoFxRate?: boolean;
}

export interface LimitedSwitchBuyOrderDTOInput {
  /**
   * Transaction type code.
   */
  type: string;
  /**
   * Security code or ISIN.
   */
  security: string;
  /**
   * Identifier of the order. Must be unique in the portfolio.
   */
  reference: string;
}

/**
 * Type expected by importSwitchOrder.
 */
export interface LimitedSwitchOrderDTOInput {
  /**
   * Sell leg of the switch.
   */
  sell: LimitedTradeOrderDTOInput;
  /**
   * Buy leg of the switch. Will inherit
   * properties from the sell leg.
   */
  buy: LimitedSwitchBuyOrderDTOInput;
}

/**
 * Response type from importSwitchOrder.
 */
export interface LimitedSwitchOrderResponseDTO {
  /**
   * Buy leg of the switch.
   */
  buy: LimitedTradeOrderDTO;
  /**
   * Sell leg of the switch.
   */
  sell: LimitedTradeOrderDTO;
}
