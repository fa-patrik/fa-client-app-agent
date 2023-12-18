import { useMemo } from "react";
import { ContactHoldingsFromAnalyticsQuery } from "api/holdings/types";
import { useGetContactInfo } from "api/initial/useGetContactInfo";
import {
  SwitchModalContent,
  SwitchModalInitialData,
} from "components/TradingModals/SwitchModalContent/SwitchModalContent";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import {
  canPortfolioTrade,
  switchableTag,
  usePermission,
} from "services/permissions/usePermission";
import { useModal } from "../../components/Modal/useModal";
import {
  BuyModalContent,
  BuyModalInitialData,
} from "../../components/TradingModals/BuyModalContent/BuyModalContent";
import {
  SellModalContent,
  SellModalInitialData,
} from "../../components/TradingModals/SellModalContent/SellModalContent";
import { useModifiedTranslation } from "../../hooks/useModifiedTranslation";
import HoldingsExcelExportButton from "./components/HoldingsExcelExportButton";
import { HoldingsGroupedByType } from "./components/HoldingsGroupedByType";
import { NoHoldings } from "./components/NoHoldings";

interface ContactHoldingsProps {
  data: ContactHoldingsFromAnalyticsQuery | undefined;
}

export const Holdings = ({ data }: ContactHoldingsProps) => {
  const { t } = useModifiedTranslation();
  const isLargeScreen = useMatchesBreakpoint("sm");
  const canTrade = usePermission(undefined, canPortfolioTrade);
  const canAnyHoldingSwitch = useMemo(() => {
    return (
      data?.contact?.analytics?.contact?.securityTypes?.some((t) =>
        t?.securities?.some((s) =>
          s?.security?.tagsAsList?.includes(switchableTag)
        )
      ) || false
    );
  }, [data?.contact?.analytics?.contact]);

  const { data: cachedContactData } = useGetContactInfo();
  const currencyCode = cachedContactData?.portfoliosCurrency;

  const securityTypes = data?.contact?.analytics?.contact?.securityTypes;

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

  if (securityTypes?.length === 0) {
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
              canAnyHoldingSwitch,
              canTrade,
              onBuyModalOpen,
              onSellModalOpen,
              onSwitchModalOpen,
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
          <Modal {...switchModalProps} header={t("switchOrderModal.header")}>
            <SwitchModalContent {...switchModalContentProps} />
          </Modal>
        </>
      )}
    </>
  );
};
