import { useMemo } from "react";
import type { Transaction as TransactionType } from "api/transactions/types";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { dateFromYYYYMMDD } from "utils/date";

export const useSplitByMonth = (data: TransactionType[]) => {
  const { t } = useModifiedTranslation();
  return useMemo(() => {
    const splitData: {
      [key: string]: TransactionType[];
    } = {};
    data.forEach((transaction) => {
      const transactionDate = dateFromYYYYMMDD(transaction.transactionDate);
      const transactionDateLabel = getYearMonthLabel(transactionDate);

      if (!splitData[transactionDateLabel]) {
        splitData[transactionDateLabel] = [];
      }
      splitData[transactionDateLabel].push(transaction);
    });
    return Object.entries(splitData)
      .sort(([dateA], [dateB]) => (dateA < dateB ? 1 : -1))
      .map(([date, transactions]) => {
        const dateArray = date.split("-").map((period) => parseInt(period));
        return {
          label: t("dateCustom", {
            date: new Date(dateArray[0], dateArray[1] - 1),
            year: "numeric",
            month: "long",
          }),
          transactions: transactions,
        };
      });
  }, [data, t]);
};

const getYearMonthLabel = (date: Date) =>
  `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}`;
