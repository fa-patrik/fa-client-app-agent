import { useGetAllPortfoliosTransactions } from "api/transactions/useGetAllPortfoliosTransactions";
import { Transactions } from "views/transactions/transactions";

export const TransactionsPage = () => {
  const queryData = useGetAllPortfoliosTransactions();

  return <Transactions {...queryData} />;
};
