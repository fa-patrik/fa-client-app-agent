import { useGetTransactionDetails } from "api/transactions/useGetTransactionDetails";
import { QueryLoadingWrapper } from "components";
import { TransactionDetails } from "./components/transactionDetails";

export type TransactionType = "transaction" | "order";

interface TransactionDetailsViewProps {
  id: string | undefined;
  type: TransactionType;
}

// handles view for transaction details and order details
export const TransactionDetailsView = ({ id }: TransactionDetailsViewProps) => {
  const queryData = useGetTransactionDetails(id);
  return (
    <QueryLoadingWrapper {...queryData} SuccessComponent={TransactionDetails} />
  );
};
