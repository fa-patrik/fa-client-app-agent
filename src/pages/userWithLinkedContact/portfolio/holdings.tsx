import { useGetPortfolioHoldings } from "api/holdings/useGetPortfolioHoldings";
import { QueryLoadingWrapper } from "components";
import { useParams } from "react-router-dom";
import { Holdings } from "views/portfolio/holdings/holdings";

export const HoldingsView = () => {
  const { portfolioId } = useParams();
  const portflioIdAsNr = portfolioId ? parseInt(portfolioId, 10) : undefined;
  const queryData = useGetPortfolioHoldings(portflioIdAsNr);
  return <QueryLoadingWrapper {...queryData} SuccessComponent={Holdings} />;
};
