import { FC, useEffect, useMemo, useState } from "react";
import { TradeOrder } from "api/orders/types";
import { Button } from "components";
import { Option, Select } from "components/Select/Select";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { getOrderTypeName, isOrderPartOfSwitch } from "utils/switchOrders";

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
  const { t, i18n } = useModifiedTranslation();

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
          (type) => type.label === getOrderTypeName(order, t, i18n.language)
        );
      const isSecurityNameMatch =
        !selectedSecurityNames.length ||
        selectedSecurityNames.some((name) => {
          if (isOrderPartOfSwitch(order)) {
            return (
              name.label === order.securityName ||
              name.label === order.linkedTransaction?.securityName
            );
          } else {
            return name.label === order.securityName;
          }
        });

      return isTransactionTypeMatch && isSecurityNameMatch;
    });

    const filteredDataBySecurityName = orderData.filter((order) => {
      const isSecurityNameMatch =
        !selectedSecurityNames.length ||
        selectedSecurityNames.some((name) => {
          if (isOrderPartOfSwitch(order)) {
            return (
              name.label === order.securityName ||
              name.label === order.linkedTransaction?.securityName
            );
          } else {
            return name.label === order.securityName;
          }
        });

      return isSecurityNameMatch;
    });

    const filteredDataByTransactionType = orderData.filter((order) => {
      const isTransactionTypeMatch =
        !selectedTransactionTypes.length ||
        selectedTransactionTypes.some((type) => {
          const typeName = getOrderTypeName(order, t, i18n.language);
          return type.label === typeName;
        });

      return isTransactionTypeMatch;
    });

    return [
      filteredDataByBoth,
      filteredDataBySecurityName,
      filteredDataByTransactionType,
    ];
  }, [
    orderData,
    selectedTransactionTypes,
    selectedSecurityNames,
    t,
    i18n.language,
  ]);

  useEffect(() => {
    onFilter(filteredDataByBoth || []);
  }, [filteredDataByBoth, onFilter]);

  const { transactionTypes, securityNames } = useMemo(() => {
    const transactionTypes = filteredDataBySecurityName?.map((order) => {
      const typeName = getOrderTypeName(order, t, i18n.language);
      return typeName;
    });
    const securityNames =
      filteredDataByTransactionType?.map((order) => order.securityName) || [];

    //if order is a switch, get also the linked leg and its security name
    const linkedSecurityNames =
      filteredDataByTransactionType?.reduce((prev, o) => {
        if (isOrderPartOfSwitch(o)) {
          const linkedOrder = o.linkedTransaction;
          if (linkedOrder?.securityName) prev.push(linkedOrder?.securityName);
        }
        return prev;
      }, [] as string[]) || [];

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
      securityNames: columnToOptions([
        ...securityNames,
        ...linkedSecurityNames,
      ]),
    };
  }, [
    filteredDataBySecurityName,
    filteredDataByTransactionType,
    i18n.language,
    t,
  ]);

  return (
    <div id="orderFilter" className="flex flex-col gap-4 w-full sm:w-fit">
      {filterHeader && (
        <div className="text-sm font-normal">{filterHeader}</div>
      )}
      <div className="grid flex-wrap grid-cols-1 sm:grid-cols-3 gap-2 -mt-3">
        <div className="w-full sm:w-48">
          <Select
            label={t("orderFilter.transactionType")}
            value={selectedTransactionTypes}
            options={transactionTypes}
            onChangeMultiple={setSelectedTransactionTypes}
            selectMultiple
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            label={t("orderFilter.securityName")}
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
            {t("orderFilter.resetFilter")}
          </Button>
        </div>
      </div>
    </div>
  );
};
