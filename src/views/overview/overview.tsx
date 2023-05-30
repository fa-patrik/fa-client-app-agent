import { useGetPortfolioBasicFieldsById } from "api/generic/useGetPortfolioBasicFieldsById";
import { SecurityTypeCode } from "api/holdings/types";
import { ContactOverviewQuery } from "api/overview/types";
import { useGetContactOverview } from "api/overview/useGetContactOverview";
import { QueryLoadingWrapper } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useMatchesBreakpoint } from "../../hooks/useMatchesBreakpoint";
import { PortfolioInfoCard } from "./components/PortfolioInfoCard";
import { TotalSummary } from "./components/TotalSummary";

export const OverviewView = () => {
  const queryData = useGetContactOverview();

  return <QueryLoadingWrapper {...queryData} SuccessComponent={Overview} />;
};

interface OverviewProps {
  data: ContactOverviewQuery;
}

const Overview = ({ data }: OverviewProps) => {
  const { t } = useModifiedTranslation();
  const contactAnalysis = data?.contact;
  //note that analytics+ doesn't return closed portfolios
  const contactPortfoliosAnalysis =
    data?.contact?.analytics?.contact?.parentPortfolios;
  const breakPortfolioInfoCard = useMatchesBreakpoint("sm");
  const { data: portfolioData } = useGetPortfolioBasicFieldsById(
    contactPortfoliosAnalysis[0]?.portfolio?.id
  );

  //assumption that all portfolios have same currency, so we use currency from first one
  const currencyCode = portfolioData?.currency.securityCode || "EUR";

  const totalTradeAmount =
    contactAnalysis?.analytics?.contact?.firstAnalysis?.tradeAmount || 0;

  const totalMarketValue =
    contactAnalysis?.analytics?.contact?.firstAnalysis?.marketValue || 0;
  return (
    <div className="grid md:grid-cols-2 gap-4 mb-4">
      <div className="grid sm:grid-cols-2 md:col-span-full gap-4">
        {breakPortfolioInfoCard ? (
          <TotalSummary
            currencyCode={currencyCode}
            marketValue={totalMarketValue}
            tradeAmount={totalTradeAmount}
          />
        ) : (
          <PortfolioInfoCard
            name={t("overviewPage.allPortfoliosSummaryTitle")}
            colorScheme="black"
            currencyCode={currencyCode}
            tradeAmount={totalTradeAmount}
            marketValue={totalMarketValue}
          />
        )}
      </div>
      {contactPortfoliosAnalysis?.map((portfolioCardData) => {
        const cash = portfolioCardData.securityTypes.find(
          (type) => type.code === SecurityTypeCode.CURRENCY
        );
        const currentBalance = cash?.firstAnalysis.marketValue;
        return (
          <PortfolioInfoCard
            currentBalance={currentBalance}
            portfolioId={portfolioCardData.portfolio.id}
            key={portfolioCardData.portfolio.id}
            currencyCode={currencyCode}
            tradeAmount={portfolioCardData.firstAnalysis.tradeAmount}
            marketValue={portfolioCardData.firstAnalysis.marketValue}
          />
        );
      })}
    </div>
  );
};
