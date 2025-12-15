import { useGetPortfolioBasicFieldsById } from "api/common/useGetPortfolioBasicFieldsById";
import type { TradeOrder } from "api/orders/types";
import { Badge } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { getBackendTranslation } from "utils/backTranslations";
import { dateFromYYYYMMDD } from "utils/date";
import { getTransactionColor } from "utils/transactions";

type TradeOrderPositionProps = TradeOrder;

export const TradeOrderPosition = ({
  securityName,
  security,
  tradeAmountInPortfolioCurrency,
  transactionDate,
  parentPortfolio,
  type: { typeNamesAsMap, typeName, amountEffect, cashFlowEffect },
}: TradeOrderPositionProps) => {
  const { i18n, t } = useModifiedTranslation();

  const { data: transactionParentPortfolio } = useGetPortfolioBasicFieldsById(
    parentPortfolio.id
  );

  return (
    <div className="py-2">
      <div className="flex justify-between">
        <div className="text-base font-semibold">
          {getBackendTranslation(
            securityName,
            security?.namesAsMap,
            i18n.language,
            i18n.resolvedLanguage
          )}
        </div>
        <div className="text-base font-medium">
          {t("numberWithCurrency", {
            value: tradeAmountInPortfolioCurrency,
            currency: transactionParentPortfolio?.currency.securityCode,
          })}
        </div>
      </div>
      <div className="flex justify-between text-xs">
        <div className="text-sm font-semibold text-gray-500">{`
        ${t("date", { date: dateFromYYYYMMDD(transactionDate) })} - ${
          transactionParentPortfolio?.name
        }`}</div>
        <Badge severity={getTransactionColor(amountEffect, cashFlowEffect)}>
          {getBackendTranslation(
            typeName,
            typeNamesAsMap,
            i18n.language,
            i18n.resolvedLanguage
          )}
        </Badge>
      </div>
    </div>
  );
};
