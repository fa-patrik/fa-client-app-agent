import {
  TradableSecurity,
  TradableSecurity as TradableSecurityInterface,
} from "api/trading/useGetTradebleSecurities";
import { BuyModalContent, Card, ErrorMessage } from "components";
import { useModal } from "components/Modal/useModal";
import { BuyModalInitialData } from "components/TradingModals/BuyModalContent/BuyModalContent";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { getBackendTranslation } from "utils/backTranslations"
import { TradableSecuritiesListBase } from "./TradableSecuritiesListBase";
import { TradableSecuritiesListMd } from "./TradableSecuritiesListMd";
import { TradableSecuritiesListXl } from "./TradableSecuritiesListXl";

interface TradableSecuritiesListProps {
  data: TradableSecurityInterface[];
}

export interface TradableSecuritiesListSized
  extends TradableSecuritiesListProps {
  onBuyModalOpen: (initialData: BuyModalInitialData) => void;
}

export interface TradableSecuritySized extends TradableSecurityInterface {
  onBuyModalOpen: (initialData: BuyModalInitialData) => void;
}

export const TradableSecuritiesList = ({
  data: securities,
}: TradableSecuritiesListProps) => {

  const { t } = useModifiedTranslation();
  const { i18n } = useModifiedTranslation();
  const locale = i18n.language

  const isSmVersion = useMatchesBreakpoint("md");
  const isXlVersion = useMatchesBreakpoint("xl");

  const {
    Modal,
    onOpen: onBuyModalOpen,
    modalProps: buyModalProps,
    contentProps: buyModalContentProps,
  } = useModal<BuyModalInitialData>();

  if (securities.length === 0) {
    return (
      <ErrorMessage header={t("tradingList.noHoldings")}>
        {t("tradingList.noHoldingsInfo")}
      </ErrorMessage>
    );
  }

  const TradableSecuritiesListSized = isXlVersion
    ? TradableSecuritiesListXl
    : isSmVersion
    ? TradableSecuritiesListMd
    : TradableSecuritiesListBase;

  return (
    <>
      {groupSecuritiesByType(securities, locale).map(([groupName, groupSecurities]) => (
        <Card header={groupName} key={groupName}>
          <TradableSecuritiesListSized
            data={groupSecurities}
            onBuyModalOpen={onBuyModalOpen}
          />
        </Card>
      ))}
      <Modal {...buyModalProps} header={t("tradingModal.buyModalHeader")}>
        <BuyModalContent {...buyModalContentProps} />
      </Modal>
    </>
  );
};

const groupSecuritiesByType = (securities: TradableSecurityInterface[], locale: string) => {
  return Object.entries(
    securities.reduce((result: Record<string, TradableSecurity[]>, current) => {
      const currentType = getBackendTranslation(current.type?.name ?? "", current.type?.namesAsMap, locale)
      if (!result[currentType]) {
        result[currentType] = [];
      }
      result[currentType].push(current);
      return result;
    }, {})
  ).sort(([group1Name], [group2Name]) => (group1Name > group2Name ? 1 : -1));
};
