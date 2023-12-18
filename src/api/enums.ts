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
