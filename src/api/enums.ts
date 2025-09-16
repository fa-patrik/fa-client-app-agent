/**
 * Method applied by backend application
 * when executing the trade order.
 */
export enum ExecutionMethod {
  NOT_DEFINED = 1,
  UNITS = 2,
  GROSS_TRADE_AMOUNT = 3,
  NET_TRADE_AMOUNT = 4,
}

/**
 * Statuses a trade order can be in.
 */
export enum OrderStatus {
  Pending = "-1", // local storage state
  Executable = "1",
  Executed = "2",
  Cancelled = "3",
  Open = "4",
  Accepted = "5",
  "In execution" = "6",
  "Executed in the market" = "7",
  Rejected = "8",
  Expired = "9",
  "Sent to execution" = "10",
  "Settled in market" = "11",
  "Partially executed in the market" = "12",
}

/**
 * Type effect. Whether the amount (units) increases, decreases, or remains the same.
 */
export enum TransactionTypeAmountEffect {
  Decreasing = -1,
  Increasing = 1,
  None = 0,
}


/**
 * Category of the account. This is an optional account field. The interpretation of this field depends on the application.
 * In Client Portal, we interpret this field as follows:
 * Internal accounts are the FA accounts (transaction against these affect cash balances in FA).
 * External accounts are the client's private accounts.
 */
export enum AccountCategory {
  Internal = "Internal",
  External = "External",
}

/**
 * Type of the account.
 * Cash flow transactions are made against cash accounts.
 * Credit accounts are used to track credit limits.
 * Other accounts are miscellaneous accounts that don't affect cash balances, 
 * e.g. the client's private bank accounts.
 */
export enum AccountType {
  Cash = "CASH",
  Credit = "CREDIT",
  Other = "OTHER",
}

/**
 * Codes for standard solution tax wrappers like ISAs.
 */
export enum StandardSolutionTaxWrapper {
  IndividualSavingsAccount = "ISA",
  StocksAndSharesISA = "SSISA",
  AdditionalPermittedSubscription = "APS",
  CashISA = "CISA",
}