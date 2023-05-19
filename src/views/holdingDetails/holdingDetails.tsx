import { HoldingPosition, SecurityDetailsPosition } from "api/holdings/types";
import { ReactComponent as MinusCircle } from "assets/minus-circle.svg";
import { ReactComponent as PlusCircle } from "assets/plus-circle.svg";
import {
  Card,
  DetailsHeading,
  Button,
  BuyModalContent,
  SellModalContent,
} from "components";
import { useModal } from "components/Modal/useModal";
import { BuyModalInitialData } from "components/TradingModals/BuyModalContent/BuyModalContent";
import { SellModalInitialData } from "components/TradingModals/SellModalContent/SellModalContent";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { PageLayout } from "layouts/PageLayout/PageLayout";
import { useNavigate } from "react-router-dom";
import { tradableTag, useCanTrade } from "services/permissions/trade";
import { getNameFromBackendTranslations } from "utils/transactions";
import { addProtocolToUrl } from "utils/url";
import { DataRow } from "./components/DataRow";
import { DocumentRow } from "./components/DocumentRow";
import { HoldingData } from "./components/HoldingData";
import { HoldingHistoryDataChart } from "./components/HoldingHistoryDataChart";
import { LineChartHeader } from "./components/LineChartHeader";
import { PerformanceRows } from "./components/PerformanceRows";

interface HoldingDetailsProps {
  data: {
    holding?: Omit<HoldingPosition, "security">;
    security: SecurityDetailsPosition;
  };
}

export const HoldingDetails = ({
  data: { security, holding },
}: HoldingDetailsProps) => {
  const {
    name,
    isinCode,
    type: { namesAsMap, code: typeCode, name: typeName },
    latestMarketData,
    currency: { securityCode: currency },
    url,
    url2,
    tagsAsSet,
    documents,
  } = security;
  const navigate = useNavigate();
  const { i18n, t } = useModifiedTranslation();

  const canTrade = useCanTrade();
  const isTradable = tagsAsSet.includes(tradableTag);

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

  const userInvestedInThisHolding = holding != null;

  return (
    <div className="flex overflow-hidden flex-col h-full">
      <DetailsHeading onBackButtonClick={() => navigate(-1)}>
        {name ?? ""}
      </DetailsHeading>
      <div className="overflow-y-auto grow-1">
        <PageLayout>
          <div className="grid gap-4 md:grid-cols-[300px_auto] lg:grid-cols-[400px_auto] xl:grid-cols-[500px_auto]">
            <div className="md:col-start-2 md:row-start-1 md:row-end-3 md:min-h-[30rem]">
              <Card
                header={
                  <LineChartHeader
                    price={latestMarketData?.price}
                    date={latestMarketData?.date}
                    currency={currency}
                  />
                }
              >
                <HoldingHistoryDataChart />
              </Card>
            </div>
            {userInvestedInThisHolding && (
              <HoldingData {...holding} typeCode={typeCode} />
            )}
            <div className="grid gap-4">
              <Card header={t("holdingsPage.security")}>
                <div className="flex flex-col px-2 my-1 divide-y">
                  <DataRow
                    label={t("holdingsPage.type")}
                    value={getNameFromBackendTranslations(
                      typeName,
                      i18n.language,
                      namesAsMap
                    )}
                  />
                  <DataRow
                    label={t("holdingsPage.isinCode")}
                    value={isinCode}
                  />
                  <DataRow
                    label={t("holdingsPage.currency")}
                    value={currency}
                  />
                  <PerformanceRows />
                  {url && (
                    <DocumentRow
                      label={t("holdingsPage.prospectus")}
                      url={addProtocolToUrl(url)}
                    />
                  )}
                  {url2 && (
                    <DocumentRow
                      label={t("holdingsPage.kiid")}
                      url={addProtocolToUrl(url2)}
                    />
                  )}
                  {documents?.map(({ fileName }) => (
                    <DocumentRow
                      key={fileName}
                      label={fileName}
                      url={addProtocolToUrl(url2)}
                    />
                  ))}
                </div>
              </Card>
              {isTradable && canTrade && (
                <>
                  <div className="grid grid-flow-col gap-2">
                    <Button
                      LeftIcon={PlusCircle}
                      onClick={() => onBuyModalOpen(security)}
                    >
                      {t("holdingsPage.buy")}
                    </Button>
                    {userInvestedInThisHolding && (
                      <Button
                        LeftIcon={MinusCircle}
                        variant="Red"
                        onClick={() => onSellModalOpen(security)}
                      >
                        {t("holdingsPage.sell")}
                      </Button>
                    )}
                  </div>
                  <Modal
                    {...buyModalProps}
                    header={t("tradingModal.buyModalHeader")}
                  >
                    <BuyModalContent {...buyModalContentProps} />
                  </Modal>
                  <Modal
                    {...sellModalProps}
                    header={t("tradingModal.sellModalHeader")}
                  >
                    <SellModalContent {...sellModalContentProps} />
                  </Modal>
                </>
              )}
            </div>
          </div>
        </PageLayout>
      </div>
    </div>
  );
};
