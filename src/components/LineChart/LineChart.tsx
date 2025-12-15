import { useMemo } from "react";
import type { ApexOptions } from "apexcharts";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import Chart from "react-apexcharts";
import theme from "tailwindTheme";
import { decimateData, DECIMATION_THRESHOLD } from "./decimateData";

export interface LineData {
  name: string;
  data: {
    x: string;
    y: number;
  }[];
}

interface LineChartProps {
  series: Array<LineData>;
  options?: ApexOptions;
  detailed?: boolean;
  isPerformanceChart?: boolean;
}

const lineChartColors = {
  fillGradientShade: "light",
  fillGradientShadeIntensity: 1,
};

const lineChartDefaultOptions: ApexOptions = {
  chart: {
    fontFamily: "Inter, sans-serif",
    sparkline: {
      enabled: true,
    },
    toolbar: {
      show: false,
    },
  },
  fill: {
    type: "gradient",
    gradient: {
      shade: lineChartColors.fillGradientShade,
      shadeIntensity: lineChartColors.fillGradientShadeIntensity,
    },
  },
  plotOptions: {
    area: {
      fillTo: "end" as const,
    },
  },
  grid: {
    padding: {
      top: 2,
      bottom: 2,
    },
  },
  theme: {
    monochrome: {
      enabled: true,
      color: theme.colors.primary["600"],
    },
  },
  dataLabels: { enabled: false },
  xaxis: {
    tickAmount: 5,
    labels: {
      rotate: 0,
      offsetX: 2,
      style: {
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
      },
    },
  },
};

export const LineChart = ({
  series,
  options,
  detailed = false,
  isPerformanceChart = false,
}: LineChartProps) => {
  const { t } = useModifiedTranslation();

  // Decimate data if it exceeds the threshold to prevent performance issues
  const decimatedSeries = useMemo(() => {
    return series.map((s) => ({
      ...s,
      data:
        s.data.length > DECIMATION_THRESHOLD
          ? decimateData(s.data, DECIMATION_THRESHOLD)
          : s.data,
    }));
  }, [series]);

  const originalDataLength = series[0].data.length;
  const isLargeDataset = originalDataLength > DECIMATION_THRESHOLD;
  const isLongPeriod = originalDataLength >= 365;
  const isVeryLongPeriod = originalDataLength >= 365 * 4;
  const performanceChartToolTipFormatting: Intl.DateTimeFormatOptions = {
    month: "short",
    year: "numeric",
    day: "numeric",
  };

  const performanceChartShortPeriodDateFormatting: Intl.DateTimeFormatOptions =
    {
      month: "short",
      day: "numeric",
    };

  const performanceChartLongPeriodDateFormatting: Intl.DateTimeFormatOptions = {
    month: isVeryLongPeriod ? undefined : "short",
    year: isVeryLongPeriod ? "numeric" : "2-digit",
  };

  const performanceChartDateFormat = isLongPeriod
    ? performanceChartLongPeriodDateFormatting
    : performanceChartShortPeriodDateFormatting;

  return (
    <div className="h-full">
      <Chart
        options={{
          ...lineChartDefaultOptions,
          // Disable animations for large datasets to improve performance
          ...(isLargeDataset && {
            chart: {
              ...lineChartDefaultOptions.chart,
              animations: {
                enabled: false,
              },
            },
          }),
          ...(detailed && {
            chart: {
              ...lineChartDefaultOptions.chart,
              sparkline: { enabled: false },
              // Disable animations for large datasets
              ...(isLargeDataset && {
                animations: {
                  enabled: false,
                },
              }),
            },
            xaxis: {
              type: isPerformanceChart
                ? "datetime"
                : lineChartDefaultOptions.xaxis?.type,
              ...lineChartDefaultOptions.xaxis,
              labels: {
                ...lineChartDefaultOptions.xaxis?.labels,
                formatter: isPerformanceChart
                  ? (value: string) =>
                      value
                        ? t("dateCustom", {
                            date: new Date(value),
                            ...performanceChartDateFormat,
                          })
                        : ""
                  : lineChartDefaultOptions.xaxis?.labels?.formatter,
              },
            },
            yaxis: {
              labels: {
                formatter: (value: number) =>
                  isPerformanceChart
                    ? t("numberWithPercent", {
                        value,
                        formatParams: {
                          value: {
                            signDisplay: "always",
                          },
                        },
                      })
                    : t("number", { value }),
                style: {
                  fontSize: "14px",
                  fontFamily: "Inter, sans-serif",
                },
              },
            },
          }),
          tooltip: {
            style: {
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
            },
            x: {
              ...lineChartDefaultOptions.tooltip?.x,
              formatter: isPerformanceChart
                ? (value: number) =>
                    value
                      ? t("dateCustom", {
                          date: new Date(value),
                          ...performanceChartToolTipFormatting,
                        })
                      : ""
                : lineChartDefaultOptions.tooltip?.x?.formatter,
            },
            y: {
              formatter: (value: number) =>
                isPerformanceChart
                  ? t("numberWithPercent", {
                      value,
                      formatParams: {
                        value: {
                          signDisplay: "always",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      },
                    })
                  : t("number", {
                      value,
                    }),
            },
          },
          ...options,
        }}
        series={decimatedSeries}
        type="area"
        height="100%"
      />
      {!detailed && (
        <XLabels labels={decimatedSeries[0].data.map((datum) => datum.x)} />
      )}
    </div>
  );
};

const getLabelPosition = (labels: string[], position: number) =>
  Math.floor((position * (labels.length - 1)) / 3);

interface XLabelsProps {
  labels: Array<string>;
}

const XLabels = ({ labels }: XLabelsProps) => {
  if (labels.length <= 2) {
    return <div className="min-h-[21px]" />;
  }

  return (
    <div className="grid relative grid-cols-2 mx-1 text-sm font-medium text-gray-500 min-h-[21px]">
      <div className="text-left">{labels[getLabelPosition(labels, 0)]}</div>
      {labels.length > 3 && (
        <div
          className="absolute "
          style={{
            left: `${
              (100 * getLabelPosition(labels, 1)) / getLabelPosition(labels, 3)
            }%`,
          }}
        >
          <div className="ml-[-50%]">{labels[getLabelPosition(labels, 1)]}</div>
        </div>
      )}
      {labels.length > 2 && (
        <div
          className="absolute "
          style={{
            left: `${
              (100 * getLabelPosition(labels, 2)) / getLabelPosition(labels, 3)
            }%`,
          }}
        >
          <div className="ml-[-50%]">{labels[getLabelPosition(labels, 2)]}</div>
        </div>
      )}
      <div className="text-right">{labels[getLabelPosition(labels, 3)]}</div>
    </div>
  );
};
