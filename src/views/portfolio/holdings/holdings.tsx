import { useGetPortfolioBasicFieldsById } from "api/generic/useGetPortfolioBasicFieldsById";
import { PortfolioHoldingsQuery } from "api/holdings/types";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useParams } from "react-router-dom";
import { useModal } from "../../../components/Modal/useModal";
import {
  BuyModalContent,
  BuyModalInitialData,
} from "../../../components/TradingModals/BuyModalContent/BuyModalContent";
import {
  SellModalContent,
  SellModalInitialData,
} from "../../../components/TradingModals/SellModalContent/SellModalContent";
import { useCanTrade } from "../../../services/permissions/trade";
import { HoldingsGroupedByType } from "../../holdings/components/HoldingsGroupedByType";
import { NoHoldings } from "../../holdings/components/NoHoldings";

export const Holdings = (props: { data: PortfolioHoldingsQuery }) => {
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
  const { portfolioId } = useParams();
  const portfolioIdAsNr = portfolioId ? parseInt(portfolioId, 10) : undefined;
  const { data: portfolioData } =
    useGetPortfolioBasicFieldsById(portfolioIdAsNr);
  const currencyCode = portfolioData?.currency.securityCode || "";
  const analytics = props.data?.analytics;
  if (analytics?.allocationTopLevel.allocationByType.length === 0) {
    return <NoHoldings />;
  }
  return (
    <>
      <div className="flex flex-col gap-4">
        {analytics?.allocationTopLevel.allocationByType.map((group) => (
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
