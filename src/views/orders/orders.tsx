import { TradeOrder } from "api/orders/types";
import { QueryData } from "api/types";
import { Card, DatePicker, QueryLoadingWrapper } from "components";
import { LocalOrder } from "hooks/useLocalTradeStorageState";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useTransactionFilter } from "hooks/useTransactionFilter";
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
  data,
  loading,
  error,
}: OrdersProps) => {
  const { t } = useModifiedTranslation();
  const { TransactionFilter, filteredData } = useTransactionFilter(data);

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
      <TransactionFilter />
      <QueryLoadingWrapper
        loading={loading}
        error={error}
        data={
          loading
            ? undefined
            : {
                orders: filteredData as TradeOrder[],
                startDate,
                endDate,
              }
        }
        SuccessComponent={OrdersContainer}
      />
    </div>
  );
};
