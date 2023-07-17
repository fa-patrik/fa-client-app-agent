import { GainLoseColoring } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { DataCard } from "./DataCard";

interface TotalSummaryProps {
  currencyCode: string;
  marketValue: number;
  tradeAmount: number;
}

export const TotalSummary = ({
  currencyCode,
  marketValue,
  tradeAmount,
}: TotalSummaryProps) => {
  const { t } = useModifiedTranslation();
  const valueChange = marketValue - tradeAmount;
  return (
    <>
      <DataCard
        colorScheme="black"
        label={t("portfolioSummary.currentMarketValue")}
        value={t("numberWithCurrencyRounded", {
          value: marketValue,
          currency: currencyCode,
        })}
      />
      <DataCard
        colorScheme="black"
        label={t("portfolioSummary.unrealizedProfits")}
        value={
          <GainLoseColoring value={valueChange}>
            {t("numberWithCurrencyRounded", {
              value: valueChange,
              currency: currencyCode,
              formatParams: {
                value: { signDisplay: "always" },
              },
            })}
          </GainLoseColoring>
        }
      />
    </>
  );
};
