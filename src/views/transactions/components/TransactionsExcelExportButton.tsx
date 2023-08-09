import { useGetPortfolioBasicFieldsById } from "api/generic/useGetPortfolioBasicFieldsById";
import { Transaction } from "api/transactions/types";
import { ReactComponent as DocumentDownloadIcon } from "assets/document-download.svg";
import { Button } from "components";
import useExcelDownloader from "hooks/useExcelDownloader";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useParams } from "react-router-dom";
import { getNameFromBackendTranslations } from "utils/transactions";

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
  const excelExportHeaders = [
    t("transactionsPage.excelCol1Header"),
    t("transactionsPage.excelCol2Header"),
    t("transactionsPage.excelCol3Header"),
    t("transactionsPage.excelCol4Header"),
    t("transactionsPage.excelCol5Header"),
  ];
  const excelExportRows =
    transactions?.reduce((prev, currTrans) => {
      const typeTranslated = getNameFromBackendTranslations(
        currTrans.type.typeName,
        i18n.language,
        currTrans.type.typeNamesAsMap
      );
      prev.push([
        currTrans.securityName,
        currTrans.transactionDate,
        currTrans.amount,
        typeTranslated,
        currTrans.tradeAmountInPortfolioCurrency,
      ]);
      return prev;
    }, [] as (string | number)[][]) || [];

  return (
    <div className="fixed right-4 bottom-4">
      <Button
        id="excelExportButton"
        size="xs"
        LeftIcon={DocumentDownloadIcon}
        disabled={!transactions?.length || loading || excelLoading}
        isLoading={excelLoading}
        onClick={() => downloadExcel(excelExportHeaders, excelExportRows)}
      >
        {t("transactionsPage.excelExportButtonLabel")}
      </Button>
    </div>
  );
};
export default TransactionsExcelExportButton;
