import { useState } from "react";
import { Transaction } from "api/transactions/types";
import { QueryData } from "api/types";
import { ReactComponent as DocumentDownloadIcon } from "assets/document-download.svg";
import {
  Button,
  Card,
  DatePicker,
  QueryLoadingWrapper,
  TransactionsFilter,
} from "components";
import useExcelDownloader from "hooks/useExcelDownloader";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { TransactionsContainer } from "./components/TransactionsContainer";


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
  const { t,i18n } = useModifiedTranslation();
  const [filteredTransactionData, setFilteredTransactionData] = useState<
    Transaction[] | undefined
  >(undefined);

  //Excel export stuff
  const excelFileName = `${t("transactionsPage.excelFileName")} ${new Date().toLocaleDateString(i18n.language, {dateStyle: "long"})}.xlsx`
  const excelSheetName = t("transactionsPage.excelSheetName")
  const { downloadExcel, loading: excelLoading } = useExcelDownloader(excelFileName, excelSheetName);
  const excelExportHeaders = [
    t("transactionsPage.excelCol1Header"),
    t("transactionsPage.excelCol2Header"),
    t("transactionsPage.excelCol3Header"),
    t("transactionsPage.excelCol4Header"),
    t("transactionsPage.excelCol5Header"),
  ];
  const excelExportRows = filteredTransactionData?.reduce((prev, currTrans) => {
    prev.push([
      currTrans.securityName,
      currTrans.transactionDate,
      currTrans.amount,
      currTrans.type.typeName,
      currTrans.tradeAmountInPortfolioCurrency
    ])
    return prev;
  }, [] as (string | number)[][]) || [];

  return (
    <div className="flex flex-col gap-4">
      <div className="fixed right-4 bottom-4">
          <Button
            size="xs"
            LeftIcon={DocumentDownloadIcon}
            disabled={loading || excelLoading}
            isLoading={excelLoading}
            onClick={() => downloadExcel(excelExportHeaders, excelExportRows)}
          >
            Download Excel
          </Button>
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
