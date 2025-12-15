import { useGetPortfolioOverviewSmart } from "api/overview/useGetPortfolioOverviewSmart";
import { QueryLoadingWrapper } from "components";
import { useParams } from "react-router-dom";
import { Holdings } from "views/portfolio/holdings/holdings";

export const HoldingsView = () => {
  const { portfolioId } = useParams();
  const portfolioIdAsNr =
    portfolioId && !isNaN(Number(portfolioId))
      ? parseInt(portfolioId, 10)
      : undefined;
  const analytics = useGetPortfolioOverviewSmart(portfolioIdAsNr);
  return (
    <QueryLoadingWrapper
      loading={analytics.loading}
      error={analytics.error}
      data={analytics.data}
      SuccessComponent={Holdings}
    />
  );
};
