import { useGetPortfolioBasicFieldsById } from "api/generic/useGetPortfolioBasicFieldsById";
import { TradeOrder } from "api/orders/types";
import { ReactComponent as DocumentDownloadIcon } from "assets/document-download.svg";
import { Button } from "components";
import useExcelDownloader from "hooks/useExcelDownloader";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useParams } from "react-router-dom";
import { getNameFromBackendTranslations } from "utils/transactions";

interface OrdersExcelExportButtonProps {
  orders: TradeOrder[] | undefined;
  startDate: Date;
  endDate: Date;
  loading: boolean;
}

const OrdersExcelExportButton = ({
  orders,
  startDate,
  endDate,
  loading,
}: OrdersExcelExportButtonProps) => {
  const { t, i18n } = useModifiedTranslation();

  //Excel export
  const { portfolioId } = useParams();
  const portfolioIdAsNr = portfolioId ? parseInt(portfolioId, 10) : undefined;
  const { data: selectedPortfolio } =
    useGetPortfolioBasicFieldsById(portfolioIdAsNr);
  const selectedPortfolioName = selectedPortfolio?.name;
  const excelFileName = `${t(
    "ordersPage.excelFileName"
  )}_${startDate.toLocaleDateString(
    i18n.language
  )}_${endDate.toLocaleDateString(i18n.language)}.xlsx`;
  const excelSheetName = t("ordersPage.excelSheetName");
  const { downloadExcel, loading: excelLoading } = useExcelDownloader(
    selectedPortfolioName
      ? `${selectedPortfolioName}_${excelFileName}`
      : excelFileName,
    selectedPortfolioName
      ? `${selectedPortfolioName}_${excelSheetName}`
      : excelSheetName
  );
  const excelExportHeaders = [
    t("ordersPage.excelCol1Header"),
    t("ordersPage.excelCol2Header"),
    t("ordersPage.excelCol3Header"),
    t("ordersPage.excelCol4Header"),
    t("ordersPage.excelCol5Header"),
  ];
  const excelExportRows =
    orders?.reduce((prev, currOrder) => {
      const typeTranslated = getNameFromBackendTranslations(
        currOrder.type.typeName,
        i18n.language,
        currOrder.type.typeNamesAsMap
      );
      prev.push([
        currOrder.securityName,
        currOrder.transactionDate,
        currOrder.amount,
        typeTranslated,
        currOrder.tradeAmountInPortfolioCurrency,
      ]);
      return prev;
    }, [] as (string | number | undefined)[][]) || [];

  return (
    <Button
      id="excelExportButton"
      size="xs"
      LeftIcon={DocumentDownloadIcon}
      disabled={!orders?.length || loading || excelLoading}
      isLoading={excelLoading}
      onClick={() => downloadExcel(excelExportHeaders, excelExportRows)}
    >
      {t("ordersPage.excelExportButtonLabel")}
    </Button>
  );
};
export default OrdersExcelExportButton;
