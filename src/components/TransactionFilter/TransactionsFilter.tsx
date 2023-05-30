import { FC, useEffect, useMemo, useState } from "react";
import { TradeOrder } from "api/orders/types";
import { Transaction } from "api/transactions/types";
import { Button } from "components";
import { Option, Select } from "components/Select/Select";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";

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
  transactionsData: Transaction[] | TradeOrder[];
  /**
   * This function will be called when the user applies the filters.
   * @param filteredData The filtered data
   */
  onFilter: (filteredData: Transaction[] | TradeOrder[]) => void;
  /**
   * The filter header
   * @example
   * ```tsx
   * filterHeader = "Filter transactions by:"
   * ```
   */
  filterHeader?: string;
};

export const TransactionsFilter: FC<TransactionsFilterProps> = ({
  transactionsData,
  onFilter,
  filterHeader,
}) => {
  const { t } = useModifiedTranslation();

  const [selectedTransactionTypes, setSelectedTransactionTypes] = useState<
    Option[]
  >([]);
  const [selectedSecurityNames, setSelectedSecurityNames] = useState<Option[]>(
    []
  );

  const [
    filteredDataByBoth,
    filteredDataBySecurityName,
    filteredDataByTransactionType,
  ] = useMemo(() => {
    if (!transactionsData) return [];
    const filteredDataByBoth = transactionsData.filter((transaction) => {
      const isTransactionTypeMatch =
        !selectedTransactionTypes.length ||
        selectedTransactionTypes.some(
          (type) => type.label === transaction.type.typeName
        );
      const isSecurityNameMatch =
        !selectedSecurityNames.length ||
        selectedSecurityNames.some(
          (name) => name.label === transaction.securityName
        );

      return isTransactionTypeMatch && isSecurityNameMatch;
    });

    const filteredDataBySecurityName = transactionsData.filter(
      (transaction) => {
        const isSecurityNameMatch =
          !selectedSecurityNames.length ||
          selectedSecurityNames.some(
            (name) => name.label === transaction.securityName
          );

        return isSecurityNameMatch;
      }
    );

    const filteredDataByTransactionType = transactionsData.filter(
      (transaction) => {
        const isTransactionTypeMatch =
          !selectedTransactionTypes.length ||
          selectedTransactionTypes.some(
            (type) => type.label === transaction.type.typeName
          );

        return isTransactionTypeMatch;
      }
    );

    return [
      filteredDataByBoth,
      filteredDataBySecurityName,
      filteredDataByTransactionType,
    ];
  }, [transactionsData, selectedTransactionTypes, selectedSecurityNames]);

  useEffect(() => {
    onFilter(filteredDataByBoth || []);
  }, [filteredDataByBoth, onFilter]);

  const { transactionTypes, securityNames } = useMemo(() => {
    const transactionTypes = filteredDataBySecurityName?.map(
      (transaction) => transaction.type.typeName
    );
    const securityNames = filteredDataByTransactionType?.map(
      (transaction) => transaction.securityName
    );

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

    return {
      transactionTypes: columnToOptions(transactionTypes),
      securityNames: columnToOptions(securityNames),
    };
  }, [filteredDataBySecurityName, filteredDataByTransactionType]);

  return (
    <div className="flex flex-col gap-4">
      {filterHeader && (
        <div className="text-sm font-normal">{filterHeader}</div>
      )}
      <div className="grid flex-wrap grid-cols-1 md:grid-cols-3 gap-2 -mt-3">
        <Select
          label={t("transactionFilter.transactionType")}
          value={selectedTransactionTypes}
          options={transactionTypes}
          onChangeMultiple={setSelectedTransactionTypes}
          selectMultiple
        />
        <Select
          label={t("transactionFilter.securityName")}
          value={selectedSecurityNames}
          options={securityNames}
          onChangeMultiple={setSelectedSecurityNames}
          selectMultiple
        />
        <div className="self-end pb-[1]">
          <Button
            onClick={() => {
              setSelectedTransactionTypes([]);
              setSelectedSecurityNames([]);
            }}
            disabled={
              !selectedTransactionTypes.length && !selectedSecurityNames.length
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
