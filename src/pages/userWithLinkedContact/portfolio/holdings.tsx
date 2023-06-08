import { useGetPortfolioOverviewSmart } from "api/overview/useGetPortfolioOverviewSmart";
import { QueryLoadingWrapper } from "components";
import { useParams } from "react-router-dom";
import { Holdings } from "views/portfolio/holdings/holdings";

export const HoldingsView = () => {
  const { portfolioId } = useParams();
  const portflioIdAsNr =
    portfolioId && !isNaN(Number(portfolioId))
      ? parseInt(portfolioId, 10)
      : undefined;
  const queryData = useGetPortfolioOverviewSmart(portflioIdAsNr);
  return <QueryLoadingWrapper {...queryData} SuccessComponent={Holdings} />;
};
