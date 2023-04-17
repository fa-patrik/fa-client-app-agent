import { useGetPortfolioBasicFieldsById } from "api/generic/useGetPortfolioBasicFieldsById";
import { TradeOrder } from "api/orders/types";
import { Badge } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { dateFromYYYYMMDD } from "utils/date";
import {
  getTransactionColor,
  getNameFromBackendTranslations,
} from "utils/transactions";

type TradeOrderPositionProps = TradeOrder;

export const TradeOrderPosition = ({
  securityName,
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
        <div className="text-base font-semibold">{securityName}</div>
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
        <Badge colorScheme={getTransactionColor(amountEffect, cashFlowEffect)}>
          {getNameFromBackendTranslations(
            typeName,
            i18n.language,
            typeNamesAsMap
          )}
        </Badge>
      </div>
    </div>
  );
};
