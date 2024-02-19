import { useMemo } from "react";
import { useGetContactInfo } from "api/common/useGetContactInfo";
import { ContactHoldingsFromAnalyticsQuery } from "api/holdings/types";
import {
  SwitchModalContent,
  SwitchModalInitialData,
} from "components/TradingModals/SwitchModalContent/SwitchModalContent";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useParams } from "react-router-dom";
import { useCanTradeSecurities } from "services/permissions/trading";

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
  const { portfolioId } = useParams();
  const portfolioIdAsNr = portfolioId ? parseInt(portfolioId, 10) : undefined;
  const securityIds = useMemo(() => {
    return (
      data?.contact.analytics.contact.securityTypes.reduce((prev, curr) => {
        const ids = curr.securities.reduce((prevS, currS) => {
          prevS.push(currS.security.id);
          return prevS;
        }, [] as number[]);
        return [...prev, ...ids];
      }, [] as number[]) || []
    );
  }, [data?.contact.analytics.contact.securityTypes]);

  const { canTradeSecurity: canTrade, canSwitchSecurity: canAnyHoldingSwitch } =
    useCanTradeSecurities(securityIds, portfolioIdAsNr);

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
    onOpen: onSellModalOpen,
    modalProps: sellModalProps,
    contentProps: sellModalContentProps,
  } = useModal<SellModalInitialData>();

  const {
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
