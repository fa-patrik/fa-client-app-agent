import type { ClientTaxAllowance } from "api/taxes/useGetClientTaxAllowances";
import { DonutChart } from "components/DonutChart/DonutChart";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import colors from "tailwindcss/colors";

interface TaxAllowancePieChartProps {
  taxAllowances: ClientTaxAllowance[];
  summary: {
    totalAllowanceAcrossAllWrappers: number;
    totalUsedAcrossAllWrappers: number;
    totalRemainingAcrossAllWrappers: number;
    currency: string;
  };
}

// Data transformation function to convert raw values to actual percentages
const transformToPercentageData = (
  taxAllowances: ClientTaxAllowance[],
  totalAllowance: number,
  totalRemaining: number
) => {
  const defaultColors = [
    "#16BDCA",
    "#FDBA8C",
    "#1A56DB",
    "#D61F69",
    "#9061F9",
    "#6875F5",
  ];
  const successGreen = colors.green[600]; // green-600 text success green for remaining allowance

  const chartData = [];

  const allowanceData = taxAllowances.map((allowance, index) => ({
    name: allowance.taxWrapperName,
    value:
      totalAllowance > 0 ? (allowance.usedAllowance / totalAllowance) * 100 : 0, // Convert to actual percentage
    rawValue: allowance.usedAllowance,
    color: defaultColors[index % defaultColors.length],
  }));

  chartData.push(...allowanceData);

  // Add remaining allowance as the last segment (in order to appear last in legend)
  if (totalRemaining > 0) {
    chartData.push({
      name: "REMAINING_ALLOWANCE",
      value: totalAllowance > 0 ? (totalRemaining / totalAllowance) * 100 : 0, // Convert to actual percentage
      rawValue: totalRemaining,
      color: successGreen,
    });
  }

  return chartData;
};

// Tax Allowance Pie Chart Component for displaying allowance breakdown
export const TaxAllowancePieChart = ({
  taxAllowances,
  summary,
}: TaxAllowancePieChartProps) => {
  const { t } = useModifiedTranslation();

  const {
    totalAllowanceAcrossAllWrappers,
    totalUsedAcrossAllWrappers,
    totalRemainingAcrossAllWrappers,
    currency,
  } = summary;

  // Transform data to actual percentages for proper pie chart display
  const chartData = transformToPercentageData(
    taxAllowances,
    totalAllowanceAcrossAllWrappers,
    totalRemainingAcrossAllWrappers
  );

  const series = chartData.map((item) => item.value);
  const labels = chartData.map((item) =>
    item.name === "REMAINING_ALLOWANCE"
      ? t("taxesPage.remainingAllowance")
      : item.name
  );
  const colors = chartData.map((item) => item.color);

  return (
    <div className="space-y-4">
      <div className="min-h-[280px] md:min-h-[343px]">
        <DonutChart
          series={series}
          labels={labels}
          options={{
            colors: colors,
          }}
        />
      </div>

      {/* Aggregated Summary Section - matches the image format */}
      <div className="flex justify-between pt-4">
        <div>
          <div className="text-sm text-gray-600">
            {t("taxesPage.totalLabel")}
          </div>
          <div className="text-base font-medium text-gray-900">
            {t("numberWithCurrencyNoDecimals", {
              value: totalAllowanceAcrossAllWrappers,
              currency,
            })}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">
            {t("taxesPage.usedLabel")}
          </div>
          <div className="text-base font-medium text-gray-900">
            {t("numberWithCurrencyNoDecimals", {
              value: totalUsedAcrossAllWrappers,
              currency,
            })}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-700">
            {t("taxesPage.remainingLabel")}
          </div>
          <div className="text-base font-semibold text-green-600">
            {t("numberWithCurrencyNoDecimals", {
              value: totalRemainingAcrossAllWrappers,
              currency,
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
