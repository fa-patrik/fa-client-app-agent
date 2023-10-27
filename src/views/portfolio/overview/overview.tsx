import { useState } from "react";
import { useGetPortfolioBasicFieldsById } from "api/generic/useGetPortfolioBasicFieldsById";
import { SecurityTypeCode } from "api/holdings/types";
import { PortfolioData } from "api/overview/types";
import { useGetPortfolioOverviewSmart } from "api/overview/useGetPortfolioOverviewSmart";
import { TimePeriodForGraph } from "api/performance/types";
import { useGetPerformance } from "api/performance/useGetPerformance";
import { ReactComponent as Spinner } from "assets/spinner.svg";
import classNames from "classnames";
import {
  ButtonRadio,
  Card,
  Center,
  LineChart,
  QueryLoadingWrapper,
} from "components";
import { Option } from "components/ButtonRadio/ButtonRadio";
import { PieChart } from "components/PieChart/PieChart";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useParams } from "react-router-dom";
import { dateFromYYYYMMDD } from "utils/date";
import { PortfolioInfoCard } from "../../overview/components/PortfolioInfoCard";
import { ListedSecuritiesCard } from "./components/ListedSecuritiesCard";
import { PortfolioSummary } from "./components/PortfolioSummary";
import { useGetChartData } from "./hooks/useGetChartData";
import { useSecuritiesSummary } from "./hooks/useSecuritiesSummary";

export const chartRangeOptions = [
  {
    id: "DAYS-7",
    label: "1W",
  },
  {
    id: "MONTHS-1",
    label: "1M",
  },
  {
    id: "MONTHS-3",
    label: "1Q",
  },
  {
    id: "CALYEAR-0",
    label: "YTD",
  },
  {
    id: "GIVEN",
    label: "All",
  },
];

export const OverviewView = () => {
  const { portfolioId } = useParams();
  const portfolioIdAsNr = portfolioId ? parseInt(portfolioId, 10) : undefined;
  const queryData = useGetPortfolioOverviewSmart(portfolioIdAsNr);
  return <QueryLoadingWrapper {...queryData} SuccessComponent={Overview} />;
};

const defaultDateFormatting = {
  day: "numeric",
  month: "short",
};

interface OverviewProps {
  data: PortfolioData | undefined;
}

const Overview = ({ data }: OverviewProps) => {
  const { portfolioId } = useParams();
  const portfolioIdAsNr = portfolioId ? parseInt(portfolioId, 10) : undefined;
  const { t } = useModifiedTranslation();
  const { data: portfolioData } =
    useGetPortfolioBasicFieldsById(portfolioIdAsNr);
  const currencyCode = portfolioData?.currency?.securityCode;

  const { topSecurities, worstSecurities } = useSecuritiesSummary(
    data?.securityTypes
  );

  const chartData = useGetChartData(data?.securityTypes);

  const [timeValue, setTimeValue] = useState<Option>({
    id: TimePeriodForGraph["DAYS-7"],
    label: "1W",
  });

  const {
    loading,
    error,
    data: performanceChartData,
  } = useGetPerformance(Number(portfolioId), timeValue.id);

  const breakPortfolioInfoCard = useMatchesBreakpoint("md");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
      <div className="grid md:grid-cols-3 md:col-span-2 gap-4">
        {breakPortfolioInfoCard ? (
          <PortfolioSummary
            currencyCode={currencyCode}
            accountBalance={
              data?.securityTypes?.find(
                (type) => type.code === SecurityTypeCode.CURRENCY
              )?.firstAnalysis?.marketValue
            }
            tradeAmount={data?.firstAnalysis?.tradeAmount}
            marketValue={data?.firstAnalysis?.marketValue}
          />
        ) : (
          <PortfolioInfoCard
            currentBalance={
              data?.securityTypes?.find(
                (type) => type.code === SecurityTypeCode.CURRENCY
              )?.firstAnalysis?.marketValue
            }
            currencyCode={currencyCode}
            tradeAmount={data?.firstAnalysis?.tradeAmount}
            marketValue={data?.firstAnalysis?.marketValue}
          />
        )}
      </div>
      <div className="grid gap-4">
        <ListedSecuritiesCard
          label={t("overviewPage.top3Holdings")}
          securities={topSecurities}
          currency={currencyCode}
        />
        <ListedSecuritiesCard
          label={t("overviewPage.worst3Holdings")}
          securities={worstSecurities}
          currency={currencyCode}
        />
      </div>
      <div>
        <Card header={t("overviewPage.pieChartLabel")}>
          <div className="pt-4 grow min-h-[300px]">
            <PieChart {...chartData} />
          </div>
        </Card>
      </div>
      <div>
        <Card header={t("overviewPage.lineChartLabel")}>
          <div className="pt-4 grow min-h-[300px]">
            {error ? (
              <Center>{t("messages.error")}</Center>
            ) : loading ? (
              <Center>
                <Spinner
                  className={classNames(
                    "w-5 h-5 text-primary-400 animate-spin fill-white"
                  )}
                />
              </Center>
            ) : (
              <LineChart
                series={[
                  {
                    name: t("overviewPage.lineChartTooltipLabel"),
                    data:
                      performanceChartData &&
                      Array.isArray(performanceChartData?.dailyValue)
                        ? performanceChartData.dailyValue.map((data) => ({
                            x: t("dateCustom", {
                              date: dateFromYYYYMMDD(data.date),
                              ...defaultDateFormatting,
                            }),
                            y: data.indexedValue - 100,
                          }))
                        : [],
                  },
                ]}
                detailed
                isPerformanceChart
              />
            )}
          </div>
          <div className="my-2.5 mx-2">
            <ButtonRadio
              value={timeValue}
              onChange={setTimeValue}
              options={chartRangeOptions}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};
