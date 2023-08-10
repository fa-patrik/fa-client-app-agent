import { useState } from "react";
import { Transaction } from "api/transactions/types";
import { QueryData } from "api/types";
import {
  Card,
  DatePicker,
  QueryLoadingWrapper,
  TransactionsFilter,
} from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { TransactionsContainer } from "./components/TransactionsContainer";
import TransactionsExcelExportButton from "./components/TransactionsExcelExportButton";

interface TransactionsProps extends QueryData<Transaction[]> {
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
  data: transactionsData,
  loading,
  error,
}: TransactionsProps) => {
  const { t } = useModifiedTranslation();
  const [filteredTransactionData, setFilteredTransactionData] = useState<
    Transaction[] | undefined
  >(undefined);

  return (
    <div className="flex flex-col gap-4">
      <div className="ml-auto">
        <TransactionsExcelExportButton
          transactions={filteredTransactionData}
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
            transactionsData={transactionsData || []}
            filterHeader={t("transactionsPage.transactionsFilterTitle")}
            onFilter={(filteredTransactionData) =>
              setFilteredTransactionData(
                filteredTransactionData as Transaction[]
              )
            }
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
                transactions: filteredTransactionData as Transaction[],
                startDate,
                endDate,
              }
        }
        SuccessComponent={TransactionsContainer}
      />
    </div>
  );
};
