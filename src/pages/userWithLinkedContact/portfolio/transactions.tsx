import { useGetPortfolioTransactions } from "api/transactions/useGetPortfolioTransactions";
import { useParams } from "react-router-dom";
import { Transactions } from "views/transactions/transactions";

export const TransactionsPage = () => {
  const { portfolioId } = useParams();
  const portfolioIdAsNr = portfolioId ? parseInt(portfolioId, 10) : undefined;
  const queryData = useGetPortfolioTransactions(portfolioIdAsNr);

  return <Transactions {...queryData} />;
};
