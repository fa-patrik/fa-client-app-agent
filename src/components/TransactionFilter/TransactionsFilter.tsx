import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { TradeOrder } from "api/orders/types";
import { Transaction } from "api/transactions/types";
import { Button } from "components";
import { Option, Select } from "components/Select/Select";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { getBackendTranslation } from "utils/backTranslations";
import { getOrderTypeName } from "utils/switchOrders";

/**
 * This component is used to filter the transaction data.
 * @example
 * ```tsx
 * <TransactionsFilter
 *  transactionsData={transactionsData}
 * onFilter={(filteredData) => setFilteredData(filteredData)}
 * />
 * ```
 */
type TransactionsFilterProps = {
  /**
   * The transaction data to be filtered
   */
  transactionsData: Transaction[] | TradeOrder[] | undefined;
  /**
   * This function will be called when the user applies the filters.
   * @param filteredData The filtered data
   */
  onFilter: (filteredData: (Transaction | TradeOrder)[]) => void;
  /**
   * The filter header
   * @example
   * ```tsx
   * filterHeader = "Filter transactions by:"
   * ```
   */
  filterHeader?: string;
};

const isTradeOrder = (
  transaction: Transaction | TradeOrder
): transaction is TradeOrder => {
  return (transaction as TradeOrder).type !== undefined;
};

const columnToOptions = (column: string[] | undefined) =>
  !column
    ? []
    : Array.from(new Set(column))
        .map((name, i) => ({
          id: name,
          label: name,
          value: name,
          count: column?.filter((t) => t === name).length || 0,
        }))
        .sort((a, b) => b.count - a.count);

export const TransactionsFilter: FC<TransactionsFilterProps> = ({
  transactionsData,
  onFilter,
  filterHeader,
}) => {
  const { t, i18n } = useModifiedTranslation();

  const getTypeName = useCallback(
    (
      transaction: Transaction | TradeOrder,
      name: string,
      namesAsMap: Record<string, string> | undefined = undefined
    ) => {
      return isTradeOrder(transaction)
        ? getOrderTypeName(transaction, t, i18n.language, i18n.resolvedLanguage)
        : getBackendTranslation(
            name,
            namesAsMap,
            i18n.language,
            i18n.resolvedLanguage
          );
    },
    [t, i18n]
  );

  const [selectedTransactionTypeOptions, setSelectedTransactionTypeOptions] =
    useState<Option[]>([]);
  const [selectedSecurityNameOptions, setSelectedSecurityNameOptions] =
    useState<Option[]>([]);

  //get the transactions filtered by the selected transaction types and security names
  const {
    filteredTransactionsBySecurityName,
    filteredTransactionsByTransactionType,
    filteredTransactionsByBoth,
  } = useMemo(() => {
    const filteredTransactionsBySecurityName: (Transaction | TradeOrder)[] = [];
    const filteredTransactionsByTransactionType: (Transaction | TradeOrder)[] =
      [];
    const filteredTransactionsByBoth: (Transaction | TradeOrder)[] = [];

    if (!transactionsData)
      return {
        filteredTransactionsBySecurityName,
        filteredTransactionsByTransactionType,
        filteredTransactionsByBoth,
      };

    for (const transaction of transactionsData) {
      const transactionTypeName = getTypeName(
        transaction,
        transaction.type.typeName,
        transaction.type.typeNamesAsMap
      );

      const securityName = getBackendTranslation(
        transaction?.securityName,
        transaction?.security?.namesAsMap,
        i18n.language,
        i18n.resolvedLanguage
      );

      const matchingTransactionType =
        !selectedTransactionTypeOptions.length ||
        selectedTransactionTypeOptions.some(
          (option) => option.label === transactionTypeName
        );

      const matchingSecurityName =
        !selectedSecurityNameOptions.length ||
        selectedSecurityNameOptions.some(
          (option) => option.label === securityName
        );

      if (matchingTransactionType && matchingSecurityName) {
        filteredTransactionsByBoth.push(transaction);
      }
      if (matchingTransactionType) {
        filteredTransactionsByTransactionType.push(transaction);
      }
      if (matchingSecurityName) {
        filteredTransactionsBySecurityName.push(transaction);
      }
    }

    return {
      filteredTransactionsBySecurityName,
      filteredTransactionsByTransactionType,
      filteredTransactionsByBoth,
    };
  }, [
    transactionsData,
    getTypeName,
    i18n,
    selectedTransactionTypeOptions,
    selectedSecurityNameOptions,
  ]);

  //next filter the available options based on the selected transaction types and security names
  const { filteredTransactionTypeOptions, filteredSecurityNameOptions } =
    useMemo(() => {
      const transactionTypes: string[] = [];
      const securityNames: string[] = [];

      filteredTransactionsBySecurityName.forEach((transaction) => {
        const transactionTypeName = getTypeName(
          transaction,
          transaction.type.typeName,
          transaction.type.typeNamesAsMap
        );

        transactionTypes.push(transactionTypeName);
      });

      filteredTransactionsByTransactionType.forEach((transaction) => {
        const securityName = getBackendTranslation(
          transaction?.securityName,
          transaction?.security?.namesAsMap,
          i18n.language,
          i18n.resolvedLanguage
        );

        securityNames.push(securityName);
      });

      return {
        filteredTransactionTypeOptions: columnToOptions(transactionTypes),
        filteredSecurityNameOptions: columnToOptions(securityNames),
      };
    }, [
      filteredTransactionsBySecurityName,
      filteredTransactionsByTransactionType,
      getTypeName,
      i18n,
    ]);

  useEffect(() => {
    if (filteredTransactionsByBoth) {
      onFilter(filteredTransactionsByBoth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTransactionsByBoth]);

  return (
    <div
      id="transactionsFilter"
      className="flex flex-col gap-4 w-full sm:w-fit"
    >
      {filterHeader && (
        <div className="text-sm font-normal">{filterHeader}</div>
      )}
      <div className="grid flex-wrap grid-cols-1 sm:grid-cols-3 gap-2 -mt-3">
        <div className="w-full sm:w-48">
          <Select
            label={t("transactionFilter.transactionType")}
            value={selectedTransactionTypeOptions}
            options={filteredTransactionTypeOptions}
            onChangeMultiple={setSelectedTransactionTypeOptions}
            selectMultiple
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            label={t("transactionFilter.securityName")}
            value={selectedSecurityNameOptions}
            options={filteredSecurityNameOptions}
            onChangeMultiple={setSelectedSecurityNameOptions}
            selectMultiple
          />
        </div>
        <div className="place-self-end sm:place-self-start pb-[1]">
          <Button
            onClick={() => {
              setSelectedTransactionTypeOptions([]);
              setSelectedSecurityNameOptions([]);
            }}
            disabled={
              !selectedTransactionTypeOptions.length &&
              !selectedSecurityNameOptions.length
            }
            variant="Secondary"
          >
            {t("transactionFilter.resetFilter")}
          </Button>
        </div>
      </div>
    </div>
  );
};
