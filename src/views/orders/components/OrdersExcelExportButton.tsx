import { useEffect, useState } from "react";
import {
  useGetPortfolioBasicFieldsById,
  useGetPortfolioBasicFieldsByIdLazy,
} from "api/common/useGetPortfolioBasicFieldsById";
import { TradeOrder } from "api/orders/types";
import { ReactComponent as DocumentDownloadIcon } from "assets/file-excel-regular.svg";
import { Button } from "components";
import useExcelDownloader from "hooks/useExcelDownloader";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useParams } from "react-router-dom";
import { getBackendTranslation } from "utils/backTranslations";

type ExportRow = (string | number | undefined)[][];
type ExportHeader = string[];

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
  const [exportRows, setExportRows] = useState<ExportRow>([]);
  const { getPortfolioBasicFields } = useGetPortfolioBasicFieldsByIdLazy();
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
  const excelExportHeaders: ExportHeader = [
    t("ordersPage.excelCol1Header"),
    t("ordersPage.excelCol2Header"),
    t("ordersPage.excelCol3Header"),
    t("ordersPage.excelCol4Header"),
    t("ordersPage.excelCol5Header"),
    t("ordersPage.excelCol6Header"),
    t("ordersPage.excelCol7Header"),
    t("ordersPage.excelCol8Header"),
  ];

  useEffect(() => {
    const getAndSetExportRows = async () => {
      const rows: ExportRow = [];
      if (orders?.length) {
        for (const order of orders) {
          const typeTranslated = getBackendTranslation(
            order?.type?.typeName,
            order?.type?.typeNamesAsMap,
            i18n.language,
            i18n.resolvedLanguage
          );
          //get portfolio data from cache or otherwise FA Back
          const portfolio = await getPortfolioBasicFields(
            order.parentPortfolio.id
          );
          rows.push([
            getBackendTranslation(
              order.securityName,
              order.security?.namesAsMap,
              i18n.language,
              i18n.resolvedLanguage
            ),
            portfolio?.name,
            order.transactionDate,
            order.amount,
            typeTranslated,
            order.tradeAmountInPortfolioCurrency,
            portfolio?.currency?.securityCode,
            t(`ordersPage.orderStatuses.${order.orderStatus}`),
          ]);
        }
      }
      setExportRows(() => rows);
    };
    getAndSetExportRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  return (
    <Button
      id="excelExportButton"
      variant="Dark"
      LeftIcon={DocumentDownloadIcon}
      disabled={!orders?.length || loading || excelLoading}
      isLoading={excelLoading}
      onClick={() => downloadExcel(excelExportHeaders, exportRows)}
    >
      {t("ordersPage.excelExportButtonLabel")}
    </Button>
  );
};
export default OrdersExcelExportButton;
