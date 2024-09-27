import { useEffect, useState } from "react";
import {
  useGetPortfolioBasicFieldsById,
  useGetPortfolioBasicFieldsByIdLazy,
} from "api/common/useGetPortfolioBasicFieldsById";
import { Transaction } from "api/transactions/types";
import { ReactComponent as DocumentDownloadIcon } from "assets/file-excel-regular.svg";
import { Button } from "components";
import useExcelDownloader from "hooks/useExcelDownloader";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useParams } from "react-router-dom";
import { getBackendTranslation } from "utils/backTranslations";

type ExportRow = (string | number | undefined)[][];
type ExportHeader = string[];

interface TransactionsExcelExportButtonProps {
  transactions: Transaction[] | undefined;
  startDate: Date;
  endDate: Date;
  loading: boolean;
}

const TransactionsExcelExportButton = ({
  transactions,
  startDate,
  endDate,
  loading,
}: TransactionsExcelExportButtonProps) => {
  const { t, i18n } = useModifiedTranslation();
  const [exportRows, setExportRows] = useState<ExportRow>([]);
  const { getPortfolioBasicFields } = useGetPortfolioBasicFieldsByIdLazy();
  //Excel export
  const { portfolioId } = useParams();
  const portfolioIdAsNr = portfolioId ? parseInt(portfolioId, 10) : undefined;
  const { data: selectedPortfolio } =
    useGetPortfolioBasicFieldsById(portfolioIdAsNr);
  const selectedPortfolioName = selectedPortfolio?.name;
  const excelFileName = `${t(
    "transactionsPage.excelFileName"
  )}_${startDate.toLocaleDateString(
    i18n.language
  )}_${endDate.toLocaleDateString(i18n.language)}.xlsx`;
  const excelSheetName = t("transactionsPage.excelSheetName");
  const { downloadExcel, loading: excelLoading } = useExcelDownloader(
    selectedPortfolioName
      ? `${selectedPortfolioName}_${excelFileName}`
      : excelFileName,
    selectedPortfolioName
      ? `${selectedPortfolioName}_${excelSheetName}`
      : excelSheetName
  );
  const excelExportHeaders: ExportHeader = [
    t("transactionsPage.excelCol1Header"),
    t("transactionsPage.excelCol2Header"),
    t("transactionsPage.excelCol3Header"),
    t("transactionsPage.excelCol4Header"),
    t("transactionsPage.excelCol5Header"),
    t("transactionsPage.excelCol6Header"),
    t("transactionsPage.excelCol7Header"),
  ];

  useEffect(() => {
    const getAndSetExportRows = async () => {
      const rows: ExportRow = [];
      if (transactions?.length) {
        for (const transaction of transactions) {
          const typeTranslated = getBackendTranslation(
            transaction?.type?.typeName,
            transaction?.type?.typeNamesAsMap,
            i18n.language,
            i18n.resolvedLanguage
          );
          //get portfolio data from cache or otherwise FA Back
          const portfolio = await getPortfolioBasicFields(
            transaction.parentPortfolio.id
          );
          rows.push([
            getBackendTranslation(
              transaction.securityName,
              transaction.security?.namesAsMap,
              i18n.language,
              i18n.resolvedLanguage
            ),
            portfolio?.name,
            transaction.transactionDate,
            transaction.amount,
            typeTranslated,
            transaction.tradeAmountInPortfolioCurrency,
            portfolio?.currency?.securityCode,
          ]);
        }
      }
      setExportRows(() => rows);
    };
    getAndSetExportRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions]);

  return (
    <Button
      variant="Dark"
      id="excelExportButton"
      LeftIcon={DocumentDownloadIcon}
      disabled={!transactions?.length || loading || excelLoading}
      isLoading={excelLoading}
      onClick={() => downloadExcel(excelExportHeaders, exportRows)}
    >
      {t("transactionsPage.excelExportButtonLabel")}
    </Button>
  );
};
export default TransactionsExcelExportButton;
