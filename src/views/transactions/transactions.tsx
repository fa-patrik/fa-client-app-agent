import { useState } from "react";
import { Transaction as TransactionType } from "api/transactions/types";
import { QueryData } from "api/types";
import { Card, DatePicker, QueryLoadingWrapper } from "components";
import { TransactionFilter } from "hooks/TransactionFilter";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { TransactionsContainer } from "./components/TransactionsContainer";

interface TransactionsProps extends QueryData<TransactionType[]> {
  startDate: Date;
  setStartDate: (newDate: Date) => void;
  endDate: Date;
  setEndDate: (newDate: Date) => void;
}

export const Transactions = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  data: transactionData,
  loading,
  error,
}: TransactionsProps) => {
  const { t } = useModifiedTranslation();
  const [filteredTransactionData, setFilteredTransactionData] = useState<
    TransactionType[] | undefined
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
      <TransactionFilter
        transactionData={transactionData || []}
        onFilter={(filteredTransactionData) =>
          setFilteredTransactionData(filteredTransactionData)
        }
      />
      <QueryLoadingWrapper
        loading={loading}
        error={error}
        data={
          loading
            ? undefined
            : {
                transactions: filteredTransactionData as TransactionType[],
                startDate,
                endDate,
              }
        }
        SuccessComponent={TransactionsContainer}
      />
    </div>
  );
};
