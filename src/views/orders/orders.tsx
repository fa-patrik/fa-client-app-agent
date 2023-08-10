import { useMemo, useState } from "react";
import { TradeOrder } from "api/orders/types";
import { QueryData } from "api/types";
import {
  Card,
  DatePicker,
  QueryLoadingWrapper,
  TransactionsFilter,
} from "components";
import { LocalOrder } from "hooks/useLocalTradeStorageState";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { OrdersContainer } from "./components/OrdersContainer";
import OrdersExcelExportButton from "./components/OrdersExcelExportButton";
import { isOrderStatusToDisplayType } from "./components/useGroupedTradeOrdersByStatus";

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
  data: transactionsData,
  loading,
  error,
}: OrdersProps) => {
  const { t } = useModifiedTranslation();
  const [filteredTransactionData, setFilteredTransactionData] = useState<
    TradeOrder[] | undefined
  >(undefined);

  const transactionsDataFilteredBySpecifiedOrderStatuses = useMemo(() => {
    if (!transactionsData) return [];
    return transactionsData.filter((transaction) =>
      isOrderStatusToDisplayType(transaction.orderStatus)
    );
  }, [transactionsData]);

  return (
    <div className="flex flex-col gap-4">
      <div className="ml-auto">
        <OrdersExcelExportButton
          orders={filteredTransactionData}
          startDate={startDate}
          endDate={endDate}
          loading={loading}
        />
      </div>
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
          <TransactionsFilter
            transactionsData={
              transactionsDataFilteredBySpecifiedOrderStatuses || []
            }
            filterHeader={t("ordersPage.transactionsFilterTitle")}
            onFilter={(filteredTransactionData) => {
              setFilteredTransactionData(filteredTransactionData);
            }}
          />
        </div>
      </Card>

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
