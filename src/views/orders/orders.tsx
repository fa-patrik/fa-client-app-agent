import { useState } from "react";
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

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex gap-2 p-2 text-normal">
          <div className="md:w-48 grow md:grow-0">
            <DatePicker
              label={t("transactionsPage.datePickerFromLabel")}
              value={startDate}
              onChange={setStartDate}
              maxDate={endDate}
            />
          </div>
          <div className="md:w-48 grow md:grow-0">
            <DatePicker
              label={t("transactionsPage.datePickerFromTo")}
              value={endDate}
              onChange={setEndDate}
              minDate={startDate}
            />
          </div>
        </div>
      </Card>
      <TransactionsFilter
        transactionsData={transactionsData || []}
        filterHeader={t("ordersPage.transactionsFilterTitle")}
        onFilter={(filteredTransactionData) => {
          setFilteredTransactionData(filteredTransactionData);
        }}
      />
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
