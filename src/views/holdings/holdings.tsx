import { AllocationByType } from "api/holdings/types";
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
import { useCanTrade } from "../../services/permissions/trade";
import { HoldingsGroupedByType } from "./components/HoldingsGroupedByType";
import { NoHoldings } from "./components/NoHoldings";

export interface HoldingsContainerProps {
  data: {
    allocationByType: AllocationByType[];
    currency: string;
  };
}

export const Holdings = ({
  data: { allocationByType, currency },
}: HoldingsContainerProps) => {
  const canTrade = useCanTrade();
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

  if (allocationByType.length === 0) {
    return <NoHoldings />;
  }
  return (
    <>
      <div className="flex flex-col gap-4">
        {allocationByType.map((group) => (
          <HoldingsGroupedByType
            key={group.code}
            currency={currency}
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
