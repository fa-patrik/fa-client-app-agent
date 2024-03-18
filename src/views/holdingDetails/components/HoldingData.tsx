import { useGetContactInfo } from "api/common/useGetContactInfo";
import { AnalyticsSecurityData, SecurityTypeCode } from "api/holdings/types";
import { Card, GainLoseColoring } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { DataRow } from "./DataRow";
import { HoldingHeader } from "./HoldingHeader";

type HoldingDataProps = AnalyticsSecurityData & {
  typeCode: SecurityTypeCode;
};

export const HoldingData = ({ firstAnalysis, typeCode }: HoldingDataProps) => {
  const { t } = useModifiedTranslation();
  const { selectedContactId } = useGetContractIdData();
  const { data: cachedContactData } = useGetContactInfo(
    false,
    selectedContactId
  );
  const currency = cachedContactData?.portfoliosCurrency;
  const valueChange =
    firstAnalysis?.marketValue !== undefined &&
    firstAnalysis?.tradeAmount !== undefined
      ? firstAnalysis?.marketValue - firstAnalysis?.tradeAmount
      : undefined;
  const valueChangePercent =
    valueChange !== undefined && firstAnalysis?.tradeAmount !== undefined
      ? valueChange /
        (firstAnalysis?.tradeAmount !== 0 ? firstAnalysis?.tradeAmount : 1)
      : undefined;
  return (
    <Card
      header={
        <HoldingHeader
          currency={currency}
          marketValue={firstAnalysis?.marketValue}
        />
      }
    >
      <div className="flex flex-col px-2 my-1 divide-y">
        <DataRow
          label={t("holdingsPage.units")}
          value={
            firstAnalysis?.amount !== undefined
              ? t("number", { value: firstAnalysis?.amount })
              : "-"
          }
        />
        <DataRow
          label={t("holdingsPage.purchaseValue")}
          value={
            firstAnalysis?.purchaseTradeAmount !== undefined
              ? t("numberWithCurrency", {
                  value: firstAnalysis?.purchaseTradeAmount,
                  currency: currency,
                })
              : "-"
          }
        />
        {typeCode === SecurityTypeCode.DEBT_INSTRUMENT && (
          <DataRow
            label={t("holdingsPage.accruedInterest")}
            value={
              firstAnalysis?.accruedInterest !== undefined
                ? t("numberWithCurrency", {
                    value: firstAnalysis?.accruedInterest,
                    currency: currency,
                  })
                : "-"
            }
          />
        )}
        <DataRow
          label={t("holdingsPage.marketValue")}
          value={
            firstAnalysis?.marketValue !== undefined
              ? t("numberWithCurrency", {
                  value: firstAnalysis?.marketValue,
                  currency: currency,
                })
              : "-"
          }
        />
        <DataRow
          label={t("holdingsPage.changePercentage")}
          value={
            <GainLoseColoring value={valueChangePercent}>
              {valueChangePercent !== undefined
                ? `${t("number", {
                    value:
                      valueChangePercent !== undefined
                        ? valueChangePercent * 100
                        : undefined,
                    formatParams: {
                      value: {
                        signDisplay: "always",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    },
                  })}%`
                : "-"}
            </GainLoseColoring>
          }
        />
        <DataRow
          label={t("holdingsPage.unrealizedProfits")}
          value={
            <GainLoseColoring value={valueChange}>
              {valueChange !== undefined
                ? t("numberWithCurrency", {
                    value: valueChange,
                    currency: currency,
                    formatParams: {
                      value: {
                        signDisplay: "always",
                      },
                    },
                  })
                : "-"}
            </GainLoseColoring>
          }
        />
      </div>
    </Card>
  );
};
