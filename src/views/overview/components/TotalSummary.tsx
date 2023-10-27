import { GainLoseColoring } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { DataCard } from "./DataCard";

interface TotalSummaryProps {
  currencyCode: string | undefined;
  marketValue: number | undefined;
  tradeAmount: number | undefined;
}

export const TotalSummary = ({
  currencyCode,
  marketValue,
  tradeAmount,
}: TotalSummaryProps) => {
  const { t } = useModifiedTranslation();
  const valueChange =
    marketValue !== undefined && tradeAmount !== undefined
      ? marketValue - tradeAmount
      : undefined;
  return (
    <>
      <DataCard
        colorScheme="black"
        label={t("portfolioSummary.currentMarketValue")}
        value={
          marketValue !== undefined
            ? t("numberWithCurrencyRounded", {
                value: marketValue,
                currency: currencyCode,
              })
            : "-"
        }
      />
      <DataCard
        colorScheme="black"
        label={t("portfolioSummary.unrealizedProfits")}
        value={
          <GainLoseColoring value={valueChange}>
            {valueChange !== undefined
              ? t("numberWithCurrencyRounded", {
                  value: valueChange,
                  currency: currencyCode,
                  formatParams: {
                    value: { signDisplay: "always" },
                  },
                })
              : "-"}
          </GainLoseColoring>
        }
      />
    </>
  );
};
