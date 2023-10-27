import { useGetPortfolioBasicFieldsById } from "api/generic/useGetPortfolioBasicFieldsById";
import { SecurityTypeDataWithSecurityData } from "api/overview/types";
import { ReactComponent as DocumentDownloadIcon } from "assets/file-excel-regular.svg";
import { Button } from "components";
import useExcelDownloader from "hooks/useExcelDownloader";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useParams } from "react-router-dom";

interface HoldingsExcelExportButtonProps {
  holdingsByType: SecurityTypeDataWithSecurityData[];
  currencyCode: string | undefined;
}

const HoldingsExcelExportButton = ({
  holdingsByType,
  currencyCode,
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
    t("holdingsPage.excelCol4Header", {
      currency: currencyCode,
    }),
    t("holdingsPage.excelCol5Header", {
      currency: currencyCode,
    }),
    t("holdingsPage.excelCol6Header", {
      currency: currencyCode,
    }),
  ];
  const excelExportRows = holdingsByType?.reduce((prev, currType) => {
    const rows = currType.securities.reduce((prev, currHolding) => {
      //holding
      //no isin comes back as " "
      const isinCode = currHolding.security.isinCode;
      const code = currHolding.code;
      const codeToDisplay =
        isinCode && isinCode !== " " ? isinCode : code ?? "-";
      const valueChange =
        currHolding.firstAnalysis?.marketValue &&
        currHolding.firstAnalysis?.tradeAmount
          ? currHolding.firstAnalysis?.marketValue -
            currHolding.firstAnalysis?.tradeAmount
          : undefined;
      const row = [
        currHolding.name,
        codeToDisplay,
        currHolding.firstAnalysis?.amount,
        currHolding.firstAnalysis?.purchaseTradeAmount,
        currHolding.firstAnalysis?.marketValue,
        valueChange,
      ];
      prev.push(row);
      return prev;
    }, [] as (string | number | undefined)[][]);
    prev.push(...rows);
    return prev;
  }, [] as (string | number | undefined)[][]);

  return (
    <Button
      id="excelExportButton"
      variant="Dark"
      LeftIcon={DocumentDownloadIcon}
      disabled={!holdingsByType?.length || excelLoading}
      isLoading={excelLoading}
      onClick={() => downloadExcel(excelExportHeaders, excelExportRows)}
    >
      {t("holdingsPage.excelExportButtonLabel")}
    </Button>
  );
};
export default HoldingsExcelExportButton;
