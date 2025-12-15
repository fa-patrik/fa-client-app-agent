import type { Transaction } from "api/transactions/types";
import { TransactionsGroup } from "./TransactionsGroup";
import { useSplitByMonth } from "./useSplitByMonth";

interface TransactionsListProps {
  transactions: Transaction[];
}

export const TransactionsGroups = ({ transactions }: TransactionsListProps) => {
  const splitData = useSplitByMonth(transactions);

  return (
    <>
      {splitData.map((group) => (
        <TransactionsGroup
          key={group.label}
          transactions={group.transactions}
          label={group.label}
          type="transaction"
        />
      ))}
    </>
  );
};
