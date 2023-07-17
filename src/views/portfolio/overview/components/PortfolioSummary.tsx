import { GainLoseColoring } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { DataCard } from "../../../overview/components/DataCard";

interface PortfolioSummaryProps {
  currencyCode: string | undefined;
  marketValue: number | undefined;
  tradeAmount: number | undefined;
  accountBalance: number | undefined;
}

export const PortfolioSummary = ({
  currencyCode,
  marketValue = 0,
  tradeAmount = 0,
  accountBalance = 0,
}: PortfolioSummaryProps) => {
  const { t } = useModifiedTranslation();
  const valueChange = marketValue - tradeAmount;
  return (
    <>
      <DataCard
        label={t("portfolioSummary.currentMarketValue")}
        value={t("numberWithCurrencyRounded", {
          value: marketValue,
          currency: currencyCode,
          maximumFractionDigits: 0,
        })}
      />
      <DataCard
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
      <DataCard
        label={t("portfolioSummary.currentBalance")}
        toolTipContent={t("portfolioSummary.currentBalanceTooltip")}
        value={t("numberWithCurrencyRounded", {
          value: accountBalance,
          currency: currencyCode,
        })}
      />
    </>
  );
};
