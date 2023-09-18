import { useGetPortfolioBasicFieldsById } from "api/generic/useGetPortfolioBasicFieldsById";
import {
  PortfolioData,
  SecurityTypeDataWithSecurityData,
} from "api/overview/types";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useParams } from "react-router-dom";
import {
  canPortfolioTrade,
  usePermission,
} from "services/permissions/usePermission";
import HoldingsExcelExportButton from "views/holdings/components/HoldingsExcelExportButton";
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
  const isLargeScreen = useMatchesBreakpoint("sm");
  const canTrade = usePermission(undefined, canPortfolioTrade);
  const { t } = useModifiedTranslation();
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

  if (data?.securityTypes.length === 0) {
    return <NoHoldings />;
  }
  return (
    <>
      <div className="flex flex-col gap-4">
        {data?.securityTypes?.length && isLargeScreen && (
          <div className="ml-auto">
            <HoldingsExcelExportButton
              holdingsByType={data.securityTypes}
              currencyCode={currencyCode}
            />
          </div>
        )}
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
