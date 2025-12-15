import type { Transaction } from "api/transactions/types";
import { NoTransactions } from "./NoTransactions";
import { TransactionsGroups } from "./TransactionsGroups";

export interface TransactionsContainerProps {
  data: {
    startDate: Date;
    endDate: Date;
    transactions: Transaction[] | undefined;
  };
}

export const TransactionsContainer = ({
  data: { startDate, endDate, transactions },
}: TransactionsContainerProps) => {
  if (!transactions || transactions.length === 0) {
    return <NoTransactions startDate={startDate} endDate={endDate} />;
  }
  return <TransactionsGroups transactions={transactions} />;
};
