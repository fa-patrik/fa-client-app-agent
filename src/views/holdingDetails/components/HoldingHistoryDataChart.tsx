import { useState } from "react";
import { MarketHistoryDataPoint } from "api/holdings/types";
import { useGetSecurityMarketDataHistory } from "api/holdings/useGetSecurityMarketDataHistory";
import { LineChart, ButtonRadio, LoadingIndicator, Center } from "components";
import { LineData } from "components/LineChart/LineChart";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useParams } from "react-router-dom";
import { dateFromYYYYMMDD } from "utils/date";

// apex charts freezes when must draw too many data points chart, we decimate them to prevent this
const safeDPNumber = 300;
const limitDataPoints = (data: MarketHistoryDataPoint[]) => {
  if (safeDPNumber > data.length) {
    return data;
  }
  const decimateRatio = Math.floor(data.length / safeDPNumber);

  return data.filter((dataPoint, index) => index % decimateRatio === 0);
};

export const HoldingHistoryDataChart = () => {
  const { holdingId } = useParams();
  const { t, i18n } = useModifiedTranslation();
  const isChartDetailed = useMatchesBreakpoint("lg");
  const locale =
    i18n.language === i18n.resolvedLanguage
      ? i18n.language
      : i18n.resolvedLanguage;
  const chartRangeOptions = [
    {
      id: "DAYS-6",
      label: t("component.lineChart.rangeOptions.DAYS-6"),
    },
    {
      id: "MONTHS-1",
      label: t("component.lineChart.rangeOptions.MONTHS-1"),
    },
    {
      id: "MONTHS-3",
      label: t("component.lineChart.rangeOptions.MONTHS-3"),
    },
    {
      id: "CALYEAR-0",
      label: t("component.lineChart.rangeOptions.CALYEAR-0"),
    },
    {
      id: "CALENDYEAR-0",
      label: t("component.lineChart.rangeOptions.CALENDYEAR-0"),
      dateFormatting: {
        day: "numeric",
        month: "numeric",
        year: "2-digit",
        lng: locale,
      },
    },
  ];

  const defaultDateFormatting = {
    day: "numeric",
    month: "short",
    lng: locale,
  };

  const [range, setRange] = useState(chartRangeOptions[0]);
  const { loading: securityLoading, data: securityData } =
    useGetSecurityMarketDataHistory(holdingId, range.id);

  const { marketDataHistory = [] } = securityData || {};

  const preparedMarketData = limitDataPoints(marketDataHistory);

  return (
    <div className="flex flex-col my-2 grow">
      <div className="relative grow">
        {securityLoading && (
          <div className="absolute w-full h-full">
            <LoadingIndicator center />
          </div>
        )}
        {!securityLoading && preparedMarketData.length === 0 && (
          <div className="absolute inset-0">
            <Center>{t("messages.noDataAvailable")}</Center>
          </div>
        )}
        <LineChart
          series={[
            {
              name: t("holdingsPage.lineChartTooltipLabel"),
              data: removeXDuplicates(
                preparedMarketData.map((data) => ({
                  x: t("dateCustom", {
                    date: dateFromYYYYMMDD(data.date),
                    ...(range.dateFormatting || defaultDateFormatting),
                  }),
                  y: data.price,
                }))
              ),
            },
          ]}
          detailed={isChartDetailed}
        />
      </div>
      <div className="my-2.5 mx-2">
        <ButtonRadio
          value={range}
          onChange={setRange}
          options={chartRangeOptions}
        />
      </div>
    </div>
  );
};

// assuming that data array is sorted
const removeXDuplicates = (seriesDataArray: LineData["data"]) =>
  seriesDataArray.filter((item, index, array) => {
    return !index || item.x !== array[index - 1].x;
  });
