import { FC, useEffect, useMemo, useState } from "react";
import { TradeOrder } from "api/orders/types";
import { Transaction } from "api/transactions/types";
import { Button, SelectFilter } from "components";
import { FilterOption } from "components/SelectFilter/SelectFilter";
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

  const [transactionType, setTransactionType] = useState<FilterOption[]>([]);
  const [securityName, setSecurityName] = useState<FilterOption[]>([]);

  const [
    filteredDataByBoth,
    filteredDataBySecurityName,
    filteredDataByTransactionType,
  ] = useMemo(() => {
    if (!transactionsData) return [];
    const filteredDataByBoth = transactionsData.filter((transaction) => {
      const isTransactionTypeMatch =
        !transactionType.length ||
        transactionType.some(
          (type) => type.label === transaction.type.typeName
        );
      const isSecurityNameMatch =
        !securityName.length ||
        securityName.some((name) => name.label === transaction.securityName);

      return isTransactionTypeMatch && isSecurityNameMatch;
    });

    const filteredDataBySecurityName = transactionsData.filter((transaction) => {
      const isSecurityNameMatch =
        !securityName.length ||
        securityName.some((name) => name.label === transaction.securityName);

      return isSecurityNameMatch;
    });

    const filteredDataByTransactionType = transactionsData.filter(
      (transaction) => {
        const isTransactionTypeMatch =
          !transactionType.length ||
          transactionType.some(
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
  }, [transactionsData, transactionType, securityName]);

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
    <div className="flex flex-col gap-4 py-4 px-2">
      {filterHeader && <div className="font-bold text-normal">{filterHeader}</div>}
      <div className="grid flex-wrap grid-cols-1 md:grid-cols-2 gap-2">
        <SelectFilter
          label={t('transactionFilter.transactionType')}
          value={transactionType}
          options={transactionTypes}
          onChange={setTransactionType}
        />
        <SelectFilter
          label={t('transactionFilter.securityName')}
          value={securityName}
          options={securityNames}
          onChange={setSecurityName}
        />
      </div>
      <div className="self-end pb-[1]">
        <Button
          onClick={() => {
            setTransactionType([]);
            setSecurityName([]);
          }}
          disabled={!transactionType.length && !securityName.length}
          variant="Secondary"
        >
          {t('transactionFilter.resetFilter')}
        </Button>
      </div>
    </div>
  );
};
