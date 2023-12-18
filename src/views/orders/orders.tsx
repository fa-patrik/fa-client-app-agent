import { useMemo, useState } from "react";
import { TradeOrder } from "api/orders/types";
import { QueryData } from "api/types";
import { Card, DatePicker, QueryLoadingWrapper } from "components";
import { OrdersFilter } from "components/TransactionFilter/OrdersFilter";
import { LocalOrder } from "hooks/useLocalTradeStorageState";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import {
  PartOfSwitch,
  getPartOfSwitch,
  linkSwitchBuyLegsToSells,
} from "utils/switchOrders";
import { OrdersContainer } from "./components/OrdersContainer";
import OrdersExcelExportButton from "./components/OrdersExcelExportButton";
import { isOrderStatusToDisplayType } from "./components/useGroupedTradeOrdersByStatus";

const filterOrders = (order: TradeOrder) => {
  //only keep orders that should be displayed to user

  //Handle switches
  //A switch consists of a sell and a buy. They are linked together.
  //We only keep one of them, and display the linked leg.
  if (order.linkedTransaction) {
    if (getPartOfSwitch(order) === PartOfSwitch.BUY) {
      return false;
    }
    if (getPartOfSwitch(order) === PartOfSwitch.SELL) {
      return (
        isOrderStatusToDisplayType(order.orderStatus) ||
        isOrderStatusToDisplayType(order.linkedTransaction.orderStatus)
      );
    }
  }
  return isOrderStatusToDisplayType(order.orderStatus);
};

interface OrdersProps extends QueryData<(TradeOrder | LocalOrder)[]> {
  startDate: Date;
  setStartDate: (newDate: Date) => void;
  endDate: Date;
  setEndDate: (newDate: Date) => void;
}

export const Orders = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  data: orderData,
  loading,
  error,
}: OrdersProps) => {
  const { t } = useModifiedTranslation();
  const [filteredTransactionData, setFilteredTransactionData] = useState<
    TradeOrder[] | undefined
  >(undefined);

  const linkedOrderData = useMemo(() => {
    return linkSwitchBuyLegsToSells(orderData);
  }, [orderData]);

  const filteredAndSortedOrders = useMemo(() => {
    if (!linkedOrderData) return [];
    return linkedOrderData
      .filter((order) => filterOrders(order))
      .sort(
        //latest first
        (oA, oB) =>
          new Date(oA.transactionDate) < new Date(oB.transactionDate) ? 1 : -1
      );
  }, [linkedOrderData]);

  const isLargeScreen = useMatchesBreakpoint("sm");

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex flex-wrap gap-2 p-2 w-full text-normal">
          <div className="sm:w-48 grow sm:grow-0">
            <DatePicker
              label={t("transactionsPage.datePickerFromLabel")}
              value={startDate}
              onChange={setStartDate}
              maxDate={endDate}
            />
          </div>
          <div className="sm:w-48 grow sm:grow-0">
            <DatePicker
              label={t("transactionsPage.datePickerFromTo")}
              value={endDate}
              onChange={setEndDate}
              minDate={startDate}
            />
          </div>
          <OrdersFilter
            orderData={filteredAndSortedOrders || []}
            filterHeader={t("ordersPage.transactionsFilterTitle")}
            onFilter={(filteredTransactionData) => {
              setFilteredTransactionData(filteredTransactionData);
            }}
          />
        </div>
      </Card>
      {isLargeScreen && (
        <div className="ml-auto">
          <OrdersExcelExportButton
            orders={filteredTransactionData}
            startDate={startDate}
            endDate={endDate}
            loading={loading}
          />
        </div>
      )}

      <QueryLoadingWrapper
        loading={loading}
        error={error}
        data={
          loading
            ? undefined
            : {
                orders: filteredTransactionData as TradeOrder[],
                startDate,
                endDate,
              }
        }
        SuccessComponent={OrdersContainer}
      />
    </div>
  );
};
