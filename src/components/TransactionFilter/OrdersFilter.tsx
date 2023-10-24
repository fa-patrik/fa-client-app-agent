import { FC, useEffect, useMemo, useState } from "react";
import { TradeOrder } from "api/orders/types";
import { Button } from "components";
import { Option, Select } from "components/Select/Select";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";

/**
 * This component is used to filter the order data.
 * @example
 * ```tsx
 * <OrdersFilter
 *  orderData={orderData}
 * onFilter={(filteredData) => setFilteredData(filteredData)}
 * />
 * ```
 */
type OrdersFilterProps = {
  /**
   * The order data to be filtered
   */
  orderData: TradeOrder[];
  /**
   * This function will be called when the user applies the filters.
   * @param filteredData The filtered data
   */
  onFilter: (filteredData: TradeOrder[]) => void;
  /**
   * The filter header
   * @example
   * ```tsx
   * filterHeader = "Filter transactions by:"
   * ```
   */
  filterHeader?: string;
};

export const OrdersFilter: FC<OrdersFilterProps> = ({
  orderData,
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
    if (!orderData) return [];
    const filteredDataByBoth = orderData.filter((order) => {
      const isTransactionTypeMatch =
        !selectedTransactionTypes.length ||
        selectedTransactionTypes.some(
          (type) => type.label === order.type.typeName
        );
      const isSecurityNameMatch =
        !selectedSecurityNames.length ||
        selectedSecurityNames.some((name) => name.label === order.securityName);

      return isTransactionTypeMatch && isSecurityNameMatch;
    });

    const filteredDataBySecurityName = orderData.filter((order) => {
      const isSecurityNameMatch =
        !selectedSecurityNames.length ||
        selectedSecurityNames.some((name) => name.label === order.securityName);

      return isSecurityNameMatch;
    });

    const filteredDataByTransactionType = orderData.filter((order) => {
      const isTransactionTypeMatch =
        !selectedTransactionTypes.length ||
        selectedTransactionTypes.some(
          (type) => type.label === order.type.typeName
        );

      return isTransactionTypeMatch;
    });

    return [
      filteredDataByBoth,
      filteredDataBySecurityName,
      filteredDataByTransactionType,
    ];
  }, [orderData, selectedTransactionTypes, selectedSecurityNames]);

  useEffect(() => {
    onFilter(filteredDataByBoth || []);
  }, [filteredDataByBoth, onFilter]);

  const { transactionTypes, securityNames } = useMemo(() => {
    const transactionTypes = filteredDataBySecurityName?.map(
      (order) => order.type.typeName
    );
    const securityNames = filteredDataByTransactionType?.map(
      (order) => order.securityName
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
            value={selectedTransactionTypes}
            options={transactionTypes}
            onChangeMultiple={setSelectedTransactionTypes}
            selectMultiple
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            label={t("transactionFilter.securityName")}
            value={selectedSecurityNames}
            options={securityNames}
            onChangeMultiple={setSelectedSecurityNames}
            selectMultiple
          />
        </div>
        <div className="place-self-end sm:place-self-start pb-[1]">
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
