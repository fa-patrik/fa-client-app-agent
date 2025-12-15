import { useMemo } from "react";
import { useGetPortfolioBasicFieldsById } from "api/common/useGetPortfolioBasicFieldsById";
import type { PortfolioData } from "api/overview/types";
import type { SwitchModalInitialData } from "components/TradingModals/SwitchModalContent/SwitchModalContent";
import { SwitchModalContent } from "components/TradingModals/SwitchModalContent/SwitchModalContent";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useParams } from "react-router-dom";
import { useCanTradeSecurities } from "services/permissions/trading";
import HoldingsExcelExportButton from "views/holdings/components/HoldingsExcelExportButton";
import { useModal } from "../../../components/Modal/useModal";
import type { BuyModalInitialData } from "../../../components/TradingModals/BuyModalContent/BuyModalContent";
import { BuyModalContent } from "../../../components/TradingModals/BuyModalContent/BuyModalContent";
import type { SellModalInitialData } from "../../../components/TradingModals/SellModalContent/SellModalContent";
import { SellModalContent } from "../../../components/TradingModals/SellModalContent/SellModalContent";
import { HoldingsGroupedByType } from "../../holdings/components/HoldingsGroupedByType";
import { NoHoldings } from "../../holdings/components/NoHoldings";

interface PortfolioHoldingsViewProps {
  data: PortfolioData | undefined;
}

export const Holdings = ({ data }: PortfolioHoldingsViewProps) => {
  const isLargeScreen = useMatchesBreakpoint("sm");
  const { portfolioId } = useParams();
  const portfolioIdAsNr = portfolioId ? parseInt(portfolioId, 10) : undefined;

  const holdings = useMemo(() => {
    return (
      data?.securityTypes
        .map((group) => group.securities.map((s) => s.security))
        .flat() || []
    );
  }, [data?.securityTypes]);

  const { canSwitchAnyHolding, canTradeAnyHolding } = useCanTradeSecurities(
    holdings,
    portfolioIdAsNr
  );

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

  const {
    onOpen: onSwitchModalOpen,
    modalProps: switchModalProps,
    contentProps: switchModalContentProps,
  } = useModal<SwitchModalInitialData>();

  const { data: portfolioData } =
    useGetPortfolioBasicFieldsById(portfolioIdAsNr);
  const currencyCode = portfolioData?.currency.securityCode;
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
        {data?.securityTypes.map((group) => (
          <HoldingsGroupedByType
            key={group.code}
            currency={currencyCode}
            tradeProps={{
              canAnyHoldingSwitch: canSwitchAnyHolding,
              canTrade: canTradeAnyHolding,
              onBuyModalOpen,
              onSellModalOpen,
              onSwitchModalOpen,
            }}
            {...group}
          />
        ))}
      </div>
      {canTradeAnyHolding && (
        <>
          <Modal {...buyModalProps} header={t("tradingModal.buyModalHeader")}>
            <BuyModalContent {...buyModalContentProps} />
          </Modal>
          <Modal {...sellModalProps} header={t("tradingModal.sellModalHeader")}>
            <SellModalContent {...sellModalContentProps} />
          </Modal>
        </>
      )}
      {canSwitchAnyHolding && (
        <Modal {...switchModalProps} header={t("switchOrderModal.header")}>
          <SwitchModalContent {...switchModalContentProps} />
        </Modal>
      )}
    </>
  );
};
