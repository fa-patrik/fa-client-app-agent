import type { TradeOrder } from "api/orders/types";
import type { Transaction } from "api/transactions/types";
import { Card } from "components";
import type { LocalOrder } from "hooks/useLocalTradeStorageState";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { TransactionsListWithOneLineRow } from "./TransactionsListWithOneLineRow";
import { TransactionsListWithTwoLinesRow } from "./TransactionsListWithTwoLinesRow";
import type { TransactionType } from "../../transactionDetails/transactionDetailsView";

export interface TransactionsListProps {
  transactions: (TradeOrder | LocalOrder)[] | Transaction[];
  type: TransactionType;
}

export type TransactionProps = (TradeOrder | Transaction) & {
  onClick?: () => void;
  showPortfolioLabel?: boolean;
};

interface TransactionsGroupProps {
  label: string;
  transactions: (TradeOrder | LocalOrder)[] | Transaction[];
  type: TransactionType;
}

export const TransactionsGroup = ({
  label,
  transactions,
  type,
}: TransactionsGroupProps) => {
  const hasOneLineRow = useMatchesBreakpoint("md");

  const TransactionsList = hasOneLineRow
    ? TransactionsListWithOneLineRow
    : TransactionsListWithTwoLinesRow;

  return (
    <Card key={label} header={label}>
      <TransactionsList transactions={transactions} type={type} />
    </Card>
  );
};
