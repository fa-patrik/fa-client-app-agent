import { useMemo } from "react";
import { useGetPortfolioBasicFieldsById } from "api/generic/useGetPortfolioBasicFieldsById";
import {
  ContactOverviewQuery,
  PortfolioData,
  SecurityData,
  SecurityTypeDataWithSecurityData,
} from "api/overview/types";
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

/**
 * Aggregate data from multiple portfolios.
 * This function will iterate through all portfolios, aggregate the properties of the firstAnalysis objects and return a data structure that contains unique security types and their aggregated data.
 *
 * @param {PortfolioData[]} portfolios - An array of portfolios to aggregate data from.
 *
 * @returns {Record<string, SecurityTypeDataWithSecurityData>} An object where the keys are security type codes and the values are aggregated data for each security type.
 */
export function aggregatePortfolioData(
  portfolios: PortfolioData[] | undefined
): Record<string, SecurityTypeDataWithSecurityData> {
  const aggregatedData: Record<string, SecurityTypeDataWithSecurityData> = {};
  if (!portfolios?.length) return aggregatedData;
  function addSecurityType(securityType: SecurityTypeDataWithSecurityData) {
    try {
      if (!aggregatedData[securityType.code]) {
        // Deep copy
        aggregatedData[securityType.code] = {
          ...securityType,
          firstAnalysis: { ...securityType.firstAnalysis },
          securities: [],
        };
      } else {
        const aggregatedSecurityType =
          aggregatedData[securityType.code].firstAnalysis;
        for (const prop in securityType.firstAnalysis) {
          if (typeof securityType.firstAnalysis[prop] === "number") {
            aggregatedSecurityType[prop] += securityType.firstAnalysis[prop];
          }
        }
      }
    } catch (err) {
      console.error(`Error adding security type data.`);
    }
  }

  function addSecurityData(
    securityTypeCode: string,
    securityData: SecurityData
  ) {
    try {
      const securityType = aggregatedData[securityTypeCode];
      const existingSecurity = securityType.securities.find(
        (s) => s.code === securityData.code
      );
      if (!existingSecurity) {
        // Deep copy
        securityType.securities.push({
          ...securityData,
          firstAnalysis: { ...securityData.firstAnalysis },
        });
      } else {
        for (const prop in securityData.firstAnalysis) {
          if (typeof securityType.firstAnalysis[prop] === "number") {
            existingSecurity.firstAnalysis[prop] +=
              securityData.firstAnalysis[prop];
          }
        }
      }
    } catch (err) {
      console.error(`Error adding security data.`);
    }
  }

  try {
    portfolios.forEach((portfolio) => {
      portfolio.securityTypes.forEach((securityType) => {
        addSecurityType(securityType);
        securityType.securities.forEach((securityData) => {
          addSecurityData(securityType.code, securityData);
        });
      });
    });
  } catch (err) {
    console.error(`Error processing portfolios.`);
  }

  return aggregatedData;
}

interface ContactHoldingsProps {
  data: ContactOverviewQuery | undefined;
}

export const Holdings = ({ data }: ContactHoldingsProps) => {
  const { t } = useModifiedTranslation();
  const isLargeScreen = useMatchesBreakpoint("sm");
  const canTrade = usePermission(undefined, canPortfolioTrade);
  const canAnyHoldingSwitch = useMemo(() => {
    return (
      data?.contact.analytics.contact.parentPortfolios.some((p) =>
        p.securityTypes.some((t) =>
          t.securities.some((s) =>
            s.security.tagsAsList.includes(switchableTag)
          )
        )
      ) ?? false
    );
  }, [data?.contact.analytics.contact.parentPortfolios]);
  const contactData = data?.contact;
  const { data: portfolioData } = useGetPortfolioBasicFieldsById(
    contactData?.analytics?.contact?.parentPortfolios?.[0]?.portfolio?.id
  );
  const currencyCode = portfolioData?.currency.securityCode || "EUR";
  const aggregatedData = useMemo(
    () =>
      aggregatePortfolioData(contactData?.analytics?.contact?.parentPortfolios),
    [contactData?.analytics?.contact?.parentPortfolios]
  );
  const securityTypes = aggregatedData ? Object.values(aggregatedData) : [];

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

  if (securityTypes.length === 0) {
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
        {securityTypes.map((group) => (
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
