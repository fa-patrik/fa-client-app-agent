import { useGetPortfolioBasicFieldsById } from "api/generic/useGetPortfolioBasicFieldsById";
import {
  PortfolioData,
  SecurityTypeDataWithSecurityData,
} from "api/overview/types";
import { ReactComponent as DocumentDownloadIcon } from "assets/document-download.svg";
import { Button } from "components";
import useExcelDownloader from "hooks/useExcelDownloader";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useParams } from "react-router-dom";
import {
  canPortfolioTrade,
  usePermission,
} from "services/permissions/usePermission";
import { useModal } from "../../../components/Modal/useModal";
import {
  BuyModalContent,
  BuyModalInitialData,
} from "../../../components/TradingModals/BuyModalContent/BuyModalContent";
import {
  SellModalContent,
  SellModalInitialData,
} from "../../../components/TradingModals/SellModalContent/SellModalContent";
import { HoldingsGroupedByType } from "../../holdings/components/HoldingsGroupedByType";
import { NoHoldings } from "../../holdings/components/NoHoldings";

interface PortfolioHoldingsViewProps {
  data: PortfolioData | undefined;
}

export const Holdings = ({ data }: PortfolioHoldingsViewProps) => {
  const canTrade = usePermission(undefined, canPortfolioTrade);
  const { t, i18n } = useModifiedTranslation();
  const {
    Modal,
    onOpen: onBuyModalOpen,
    modalProps: buyModalProps,
    contentProps: buyModalContentProps,
  } = useModal<BuyModalInitialData>();

  const {
    onOpen: onSellModalOpen,
    modalProps: sellModalProps,
    contentProps: sellModalContentProps,
  } = useModal<SellModalInitialData>();
  const { portfolioId } = useParams();
  const portfolioIdAsNr = portfolioId ? parseInt(portfolioId, 10) : undefined;
  const { data: portfolioData } =
    useGetPortfolioBasicFieldsById(portfolioIdAsNr);
  const currencyCode = portfolioData?.currency.securityCode || "";

  //Excel export stuff
  const excelFileName = `${t("holdingsPage.excelFileName")} - ${portfolioData?.name} - ${new Date().toLocaleDateString(i18n.language, {dateStyle: "long"})}.xlsx`
  const excelSheetName = `${t("holdingsPage.excelSheetName")} - ${portfolioData?.name} `
  const { downloadExcel, loading } = useExcelDownloader(excelFileName, excelSheetName);
  const excelExportHeaders = [
    t("holdingsPage.excelCol1Header"),
    t("holdingsPage.excelCol2Header"),
    t("holdingsPage.excelCol3Header"),
    t("holdingsPage.excelCol4Header"),
    t("holdingsPage.excelCol5Header"),
    t("holdingsPage.excelCol6Header"),
  ];
  const excelExportRows = data?.securityTypes?.reduce((prev, currSecType) => {
    //security type
    //prev.push([currSecType.name,"","",currSecType.firstAnalysis.marketValue,currSecType.firstAnalysis.marketValue-currSecType.firstAnalysis.tradeAmount])
    const rows = currSecType.securities.reduce((prev, currSec) => {
      //security
      const row = [
        currSec.name,
        currSec.code,
        currSec.firstAnalysis.amount,
        currSec.firstAnalysis.purchaseTradeAmount,
        currSec.firstAnalysis.marketValue,
        currSec.firstAnalysis.marketValue - currSec.firstAnalysis.tradeAmount,
      ];
      prev.push(row);
      return prev;
    }, [] as (string | number)[][]);
    prev.push(...rows);
    return prev;
  }, [] as (string | number)[][]);

  if (data?.securityTypes.length === 0) {
    return <NoHoldings />;
  }
  return (
    <>
      <div className="flex flex-col gap-4">
      <div className="fixed right-4 bottom-4">
          <Button
            size="xs"
            LeftIcon={DocumentDownloadIcon}
            disabled={loading}
            isLoading={loading}
            onClick={() => downloadExcel(excelExportHeaders, excelExportRows || [] )}
          >
            Download Excel
          </Button>
        </div>
        {data?.securityTypes.map((group: SecurityTypeDataWithSecurityData) => (
          <HoldingsGroupedByType
            key={group.code}
            currency={currencyCode}
            tradeProps={{
              canTrade,
              onBuyModalOpen,
              onSellModalOpen,
            }}
            {...group}
          />
        ))}
      </div>
      {canTrade && (
        <>
          <Modal {...buyModalProps} header={t("tradingModal.buyModalHeader")}>
            <BuyModalContent {...buyModalContentProps} />
          </Modal>
          <Modal {...sellModalProps} header={t("tradingModal.sellModalHeader")}>
            <SellModalContent {...sellModalContentProps} />
          </Modal>
        </>
      )}
    </>
  );
};
