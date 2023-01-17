import { HoldingPosition, SecurityTypeCode } from "api/holdings/types";
import { useGetContactInfo } from "api/initial/useGetContactInfo";
import { Card, GainLoseColoring } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { DataRow } from "./DataRow";
import { HoldingHeader } from "./HoldingHeader";

type HoldingDataProps = Omit<HoldingPosition, "security"> & {
  typeCode: SecurityTypeCode;
};

export const HoldingData = ({
  amount,
  purchaseTradeAmount,
  accruedInterest,
  marketValue,
  valueChangeRelative,
  valueChangeAbsolute,
  typeCode,
}: HoldingDataProps) => {
  const { t } = useModifiedTranslation();
  const { selectedContactId } = useGetContractIdData();
  const { data: { portfoliosCurrency } = { portfoliosCurrency: "EUR" } } =
    useGetContactInfo(false, selectedContactId);
  return (
    <Card
      header={
        <HoldingHeader
          currency={portfoliosCurrency}
          marketValue={marketValue}
        />
      }
    >
      <div className="flex flex-col px-2 my-1 divide-y">
        <DataRow
          label={t("holdingsPage.units")}
          value={t("number", { value: amount })}
        />
        <DataRow
          label={t("holdingsPage.purchaseValue")}
          value={t("numberWithCurrency", {
            value: purchaseTradeAmount,
            currency: portfoliosCurrency,
          })}
        />
        {typeCode === SecurityTypeCode.DEBT_INSTRUMENT && (
          <DataRow
            label={t("holdingsPage.accruedInterest")}
            value={t("numberWithCurrency", {
              value: accruedInterest,
              currency: portfoliosCurrency,
            })}
          />
        )}
        <DataRow
          label={t("holdingsPage.marketValue")}
          value={t("numberWithCurrency", {
            value: marketValue,
            currency: portfoliosCurrency,
          })}
        />
        <DataRow
          label={t("holdingsPage.changePercentage")}
          value={
            <GainLoseColoring value={valueChangeRelative}>
              {`${t("number", {
                value: valueChangeRelative * 100,
                formatParams: {
                  value: {
                    signDisplay: "always",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  },
                },
              })}%`}
            </GainLoseColoring>
          }
        />
        <DataRow
          label={t("holdingsPage.unrealizedProfits")}
          value={
            <GainLoseColoring value={valueChangeRelative}>
              {t("numberWithCurrency", {
                value: valueChangeAbsolute,
                currency: portfoliosCurrency,
                formatParams: {
                  value: {
                    signDisplay: "always",
                  },
                },
              })}
            </GainLoseColoring>
          }
        />
      </div>
    </Card>
  );
};
