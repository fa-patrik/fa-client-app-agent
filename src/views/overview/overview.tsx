import { SecurityTypeCode } from "api/holdings/types";
import { useGetContactInfo } from "api/initial/useGetContactInfo";
import { ContactOverviewQuery } from "api/overview/types";
import { useGetContactCashFromPfReport } from "api/overview/useGetContactCashFromPfReport";
import { useGetContactOverview } from "api/overview/useGetContactOverview";
import { QueryLoadingWrapper } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useMatchesBreakpoint } from "../../hooks/useMatchesBreakpoint";
import { PortfolioInfoCard } from "./components/PortfolioInfoCard";
import { TotalSummary } from "./components/TotalSummary";

export const OverviewView = () => {
  useGetContactCashFromPfReport();
  const queryData = useGetContactOverview();
  return <QueryLoadingWrapper {...queryData} SuccessComponent={Overview} />;
};

interface OverviewProps {
  data: ContactOverviewQuery | undefined;
}

const Overview = ({ data }: OverviewProps) => {
  const { t } = useModifiedTranslation();
  const contactAnalysis = data?.contact;
  //note that analytics+ doesn't return closed portfolios
  const contactPortfoliosAnalysis =
    data?.contact?.analytics?.contact?.parentPortfolios;
  const breakPortfolioInfoCard = useMatchesBreakpoint("sm");
  const { data: cachedContactData } = useGetContactInfo();

  //assumption that all portfolios have same currency, so we use currency from first one
  const currencyCode = cachedContactData?.portfoliosCurrency;

  const totalTradeAmount =
    contactAnalysis?.analytics?.contact?.firstAnalysis?.tradeAmount;

  const totalMarketValue =
    contactAnalysis?.analytics?.contact?.firstAnalysis?.marketValue;

  const contactCash = useGetContactCashFromPfReport()?.data;

  return (
    <div className="grid md:grid-cols-2 gap-4 mb-4">
      <div className="grid sm:grid-cols-2 md:col-span-full gap-4">
        {breakPortfolioInfoCard ? (
          <TotalSummary
            currencyCode={currencyCode}
            marketValue={totalMarketValue} //we need to default these values to 0
            tradeAmount={totalTradeAmount} //because empty portfolios get undefined from the api
          />
        ) : (
          <PortfolioInfoCard
            name={t("overviewPage.allPortfoliosSummaryTitle")}
            colorScheme="black"
            currencyCode={currencyCode}
            tradeAmount={totalTradeAmount}
            marketValue={totalMarketValue}
            currentBalance={contactCash}
          />
        )}
      </div>
      {contactPortfoliosAnalysis?.map((portfolioCardData) => {
        const cash = portfolioCardData?.securityTypes?.find(
          (type) => type.code === SecurityTypeCode.CURRENCY
        );
        const currentBalance = cash?.firstAnalysis?.marketValue;
        return (
          <PortfolioInfoCard
            currentBalance={currentBalance}
            portfolioId={portfolioCardData?.portfolio?.id}
            key={portfolioCardData?.portfolio?.id}
            currencyCode={currencyCode}
            tradeAmount={portfolioCardData?.firstAnalysis?.tradeAmount}
            marketValue={portfolioCardData?.firstAnalysis?.marketValue}
          />
        );
      })}
    </div>
  );
};
