import { PortfolioStatus } from "api/initial/useGetContactInfo";
import { AllPortfolios } from "api/overview/types";
import { useGetAllPortfolios } from "api/overview/useGetAllPortfolios";
import { QueryLoadingWrapper } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useMatchesBreakpoint } from "../../hooks/useMatchesBreakpoint";
import { PortfolioInfoCard } from "./components/PortfolioInfoCard";
import { TotalSummary } from "./components/TotalSummary";

export const OverviewView = () => {
  const queryData = useGetAllPortfolios();

  return <QueryLoadingWrapper {...queryData} SuccessComponent={Overview} />;
};

interface OverviewProps {
  data: AllPortfolios;
}

const Overview = ({ data }: OverviewProps) => {
  const { t } = useModifiedTranslation();
  const { portfolioReport: allPortfoliosReport, portfolios } = data;
  const breakPortfolioInfoCard = useMatchesBreakpoint("sm");

  //ensure active, passive portfolios only
  const activePortfoliosInData = portfolios.filter(
    (portfolio) => portfolio.status !== PortfolioStatus.Closed
  );

  return (
    <div className="grid md:grid-cols-2 gap-4 mb-4">
      <div className="grid sm:grid-cols-2 md:col-span-full gap-4">
        {breakPortfolioInfoCard ? (
          <TotalSummary {...allPortfoliosReport} />
        ) : (
          <PortfolioInfoCard
            {...allPortfoliosReport}
            name={t("overviewPage.allPortfoliosSummaryTitle")}
            colorScheme="black"
            // there is no way to get currency for aggregated portfolioReport (portfolioReport under contact context),
            // but all portfolios have same currency, so we use currency from first one
            portfolio={activePortfoliosInData[0]?.portfolioReport.portfolio}
          />
        )}
      </div>
      {activePortfoliosInData.map((portfolio) => {
        const { name, portfolioReport, id } = portfolio;
        return (
          <PortfolioInfoCard
            key={id}
            {...portfolioReport}
            id={id}
            name={name}
          />
        );
      })}
    </div>
  );
};
