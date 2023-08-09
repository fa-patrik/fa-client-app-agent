import { useGetPortfolioBasicFieldsById } from "api/generic/useGetPortfolioBasicFieldsById";
import { SecurityTypeDataWithSecurityData } from "api/overview/types";
import { ReactComponent as DocumentDownloadIcon } from "assets/document-download.svg";
import { Button } from "components";
import useExcelDownloader from "hooks/useExcelDownloader";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useParams } from "react-router-dom";

interface HoldingsExcelExportButtonProps {
  holdingsByType: SecurityTypeDataWithSecurityData[];
}

const HoldingsExcelExportButton = ({
  holdingsByType,
}: HoldingsExcelExportButtonProps) => {
  const { t, i18n } = useModifiedTranslation();
  const { portfolioId } = useParams();
  const portfolioIdAsNr = portfolioId ? parseInt(portfolioId, 10) : undefined;
  const { data: selectedPortfolio } =
    useGetPortfolioBasicFieldsById(portfolioIdAsNr);
  const selectedPortfolioName = selectedPortfolio?.name;
  const excelFileName = `${t(
    "holdingsPage.excelFileName"
  )}_${new Date().toLocaleDateString(i18n.language)}.xlsx`;
  const excelSheetName = t("holdingsPage.excelSheetName");
  const { downloadExcel, loading: excelLoading } = useExcelDownloader(
    selectedPortfolioName
      ? `${selectedPortfolioName}_${excelFileName}`
      : excelFileName,
    selectedPortfolioName
      ? `${selectedPortfolioName}_${excelSheetName}`
      : excelSheetName
  );
  const excelExportHeaders = [
    t("holdingsPage.excelCol1Header"),
    t("holdingsPage.excelCol2Header"),
    t("holdingsPage.excelCol3Header"),
    t("holdingsPage.excelCol4Header"),
    t("holdingsPage.excelCol5Header"),
    t("holdingsPage.excelCol6Header"),
  ];
  const excelExportRows = holdingsByType?.reduce((prev, currType) => {
    const rows = currType.securities.reduce((prev, currHolding) => {
      //holding
      const row = [
        currHolding.name,
        currHolding.code,
        currHolding.firstAnalysis.amount,
        currHolding.firstAnalysis.purchaseTradeAmount,
        currHolding.firstAnalysis.marketValue,
        currHolding.firstAnalysis.marketValue -
          currHolding.firstAnalysis.tradeAmount,
      ];
      prev.push(row);
      return prev;
    }, [] as (string | number)[][]);
    prev.push(...rows);
    return prev;
  }, [] as (string | number)[][]);

  return (
    <div className="fixed right-4 bottom-4">
      <Button
        id="excelExportButton"
        size="xs"
        LeftIcon={DocumentDownloadIcon}
        disabled={!holdingsByType?.length || excelLoading}
        isLoading={excelLoading}
        onClick={() => downloadExcel(excelExportHeaders, excelExportRows)}
      >
        {t("holdingsPage.excelExportButtonLabel")}
      </Button>
    </div>
  );
};
export default HoldingsExcelExportButton;
