import { useMemo } from "react";
import { useGetContactInfo } from "api/common/useGetContactInfo";
import type { ContactHoldingsFromAnalyticsQuery } from "api/holdings/types";
import type { SwitchModalInitialData } from "components/TradingModals/SwitchModalContent/SwitchModalContent";
import { SwitchModalContent } from "components/TradingModals/SwitchModalContent/SwitchModalContent";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useParams } from "react-router-dom";
import { useCanTradeSecurities } from "services/permissions/trading";

import HoldingsExcelExportButton from "./components/HoldingsExcelExportButton";
import { HoldingsGroupedByType } from "./components/HoldingsGroupedByType";
import { NoHoldings } from "./components/NoHoldings";
import { useModal } from "../../components/Modal/useModal";
import type { BuyModalInitialData } from "../../components/TradingModals/BuyModalContent/BuyModalContent";
import { BuyModalContent } from "../../components/TradingModals/BuyModalContent/BuyModalContent";
import type { SellModalInitialData } from "../../components/TradingModals/SellModalContent/SellModalContent";
import { SellModalContent } from "../../components/TradingModals/SellModalContent/SellModalContent";
import { useModifiedTranslation } from "../../hooks/useModifiedTranslation";

interface ContactHoldingsProps {
  data: ContactHoldingsFromAnalyticsQuery | undefined;
}

export const Holdings = ({ data }: ContactHoldingsProps) => {
  const { t } = useModifiedTranslation();
  const isLargeScreen = useMatchesBreakpoint("sm");
  const { portfolioId } = useParams();
  const portfolioIdNr = portfolioId ? parseInt(portfolioId) : undefined;
  const hasSelectedPortfolio = !!portfolioIdNr;
  const holdings = useMemo(() => {
    return (
      data?.contact?.analytics?.contact?.securityTypes
        .map((group) => group.securities.map((security) => security.security))
        .flat() || []
    );
  }, [data?.contact?.analytics?.contact?.securityTypes]);
  const { canSwitchAnyHolding, canTradeAnyHolding } =
    useCanTradeSecurities(holdings);

  const { selectedContactId } = useGetContractIdData();
  const { data: cachedContactData } = useGetContactInfo(
    false,
    selectedContactId
  );

  const currencyCode = cachedContactData?.portfoliosCurrency;

  const securityTypes = data?.contact?.analytics?.contact?.securityTypes;

  const {
    Modal,
    onOpen: onBuyModalOpen,
    modalProps: buyModalProps,
    contentProps: buyModalContentProps,
  } = useModal<BuyModalInitialData>();

  const {
    Modal: SellModal,
    onOpen: onSellModalOpen,
    modalProps: sellModalProps,
    contentProps: sellModalContentProps,
  } = useModal<SellModalInitialData>();

  const {
    Modal: SwitchModal,
    onOpen: onSwitchModalOpen,
    modalProps: switchModalProps,
    contentProps: switchModalContentProps,
  } = useModal<SwitchModalInitialData>();

  if (!securityTypes?.length) {
    return <NoHoldings />;
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {!!securityTypes?.length && isLargeScreen && (
          <div className="ml-auto">
            <HoldingsExcelExportButton
              holdingsByType={securityTypes}
              currencyCode={currencyCode}
            />
          </div>
        )}
        {securityTypes?.map((group) => (
          <HoldingsGroupedByType
            key={group.code}
            currency={currencyCode}
            tradeProps={{
              canAnyHoldingSwitch: canSwitchAnyHolding && hasSelectedPortfolio,
              canTrade: canTradeAnyHolding && hasSelectedPortfolio,
              onBuyModalOpen,
              onSellModalOpen,
              onSwitchModalOpen,
            }}
            {...group}
          />
        ))}
      </div>

      {hasSelectedPortfolio && canTradeAnyHolding && (
        <>
          <Modal {...buyModalProps} header={t("tradingModal.buyModalHeader")}>
            <BuyModalContent {...buyModalContentProps} />
          </Modal>
          <SellModal
            {...sellModalProps}
            header={t("tradingModal.sellModalHeader")}
          >
            <SellModalContent {...sellModalContentProps} />
          </SellModal>
        </>
      )}
      {hasSelectedPortfolio && canSwitchAnyHolding && (
        <SwitchModal
          {...switchModalProps}
          header={t("switchOrderModal.header")}
        >
          <SwitchModalContent {...switchModalContentProps} />
        </SwitchModal>
      )}
    </>
  );
};
