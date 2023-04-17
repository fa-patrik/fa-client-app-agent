import { useGetPortfolioBasicFieldsById } from "api/generic/useGetPortfolioBasicFieldsById";
import { Badge } from "components";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useParams } from "react-router-dom";
import { dateFromYYYYMMDD } from "utils/date";
import {
  getNameFromBackendTranslations,
  getTransactionColor,
} from "utils/transactions";
import { useNavigateToDetails } from "../useNavigateToDetails";
import { TransactionProps, TransactionsListProps } from "./TransactionsGroup";

export const TransactionsListWithOneLineRow = ({
  transactions,
  type,
}: TransactionsListProps) => {
  const { portfolioId } = useParams();
  const showPortfolioLabel = !portfolioId;
  const { t } = useModifiedTranslation();
  const navigate = useNavigateToDetails(type);

  const isLgVersion = useMatchesBreakpoint("lg");

  return (
    <div>
      <table className="w-full table-fixed">
        <thead className="text-sm font-semibold text-gray-500 bg-gray-100 border-t">
          <tr>
            <th className="py-1 px-2 text-left">
              {t("transactionsPage.security")}
            </th>
            {showPortfolioLabel && (
              <th className="p-1 text-left">
                {t("transactionsPage.portfolioName")}
              </th>
            )}
            <th className="p-1 text-right">
              {t("transactionsPage.transactionDate")}
            </th>
            {isLgVersion && (
              <th className="p-1 text-right">{t("transactionsPage.units")}</th>
            )}
            <th className="p-1 text-center">{t("transactionsPage.type")}</th>
            <th className="py-1 px-2 text-right">
              {t("transactionsPage.tradeAmount")}
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <Transaction
              {...transaction}
              key={transaction.id}
              showPortfolioLabel={showPortfolioLabel}
              onClick={navigate(transaction.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Transaction = ({
  transactionDate,
  amount,
  type,
  tradeAmountInPortfolioCurrency,
  securityName,
  parentPortfolio,
  onClick,
  showPortfolioLabel,
}: TransactionProps) => {
  const { t, i18n } = useModifiedTranslation();
  const isLgVersion = useMatchesBreakpoint("lg");

  const typeTranslated = getNameFromBackendTranslations(
    type.typeName,
    i18n.language,
    type.typeNamesAsMap
  );

  const TypeBadge = () => {
    return (
      <Badge
        colorScheme={getTransactionColor(
          type.amountEffect,
          type.cashFlowEffect
        )}
      >
        {typeTranslated}
      </Badge>
    );
  };

  const { data: transactionParentPortfolio } = useGetPortfolioBasicFieldsById(
    parentPortfolio.id
  );

  return (
    <>
      <tr
        onClick={onClick}
        className="h-12 hover:bg-primary-50 border-t transition-colors cursor-pointer"
      >
        <td className="px-2 font-semibold text-left">{securityName}</td>
        {showPortfolioLabel && (
          <td className="px-1 text-sm md:text-base text-left text-gray-500">
            {transactionParentPortfolio?.name}
          </td>
        )}
        <td className="px-1 text-sm md:text-base font-medium text-right text-gray-500">
          <span>{t("date", { date: dateFromYYYYMMDD(transactionDate) })}</span>
        </td>
        {isLgVersion && (
          <td className="px-1 text-base font-medium text-right">
            {amount != null ? t("number", { value: amount }) : "-"}
          </td>
        )}
        <td className="px-1 ">
          <div className="flex justify-center">
            <TypeBadge />
          </div>
        </td>
        <td className="px-2 text-base font-medium text-right">
          {t("numberWithCurrency", {
            value: tradeAmountInPortfolioCurrency,
            currency: transactionParentPortfolio?.currency.securityCode,
          })}
        </td>
      </tr>
    </>
  );
};
