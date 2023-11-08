import { ApexOptions } from "apexcharts";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import Chart from "react-apexcharts";
import theme from "tailwindTheme";

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

  const isLongPeriod = series[0].data.length >= 365;
  const isVeryLongPeriod = series[0].data.length >= 365 * 4;

  const performanceChartLongPeriodDateFormatting = {
    month: isVeryLongPeriod ? undefined : "short",
    year: "numeric",
  };

  const performanceChartShortPeriodDateFormatting = {
    month: "short",
    day: "numeric",
  };

  const dateFormatting = isLongPeriod
    ? performanceChartLongPeriodDateFormatting
    : performanceChartShortPeriodDateFormatting;

  return (
    <div className="h-full">
      <Chart
        options={{
          ...lineChartDefaultOptions,
          ...(detailed && {
            chart: {
              ...lineChartDefaultOptions.chart,
              sparkline: { enabled: false },
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
                            ...dateFormatting,
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
        series={series}
        type="area"
        height="100%"
      />
      {!detailed && <XLabels labels={series[0].data.map((datum) => datum.x)} />}
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
