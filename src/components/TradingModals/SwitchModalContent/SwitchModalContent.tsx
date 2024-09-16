import { MutableRefObject, useMemo, useState } from "react";
import { useGetContactInfo } from "api/common/useGetContactInfo";
import { ADVISOR_TAG } from "api/constants";
import { ExecutionMethod, OrderStatus } from "api/enums";
import { HoldingPosition } from "api/holdings/types";
import { useGetContactHoldingsFromPfReport } from "api/holdings/useGetContactHoldingsFromPfReport";
import { useGetPortfolioHoldingsFromPfReport } from "api/holdings/useGetPortfolioHoldingsFromPfReport";
import { TradableSecurity } from "api/trading/useGetTradebleSecurities";
import { useSwitch } from "api/trading/useSwitch";
import { TransactionType } from "api/transactions/enums";
import { LimitedSwitchOrderDTOInput } from "api/types";
import { ComboBox, Option } from "components/ComboBox/ComboBox";
import {
  DownloadableDocument,
  Button,
  LoadingIndicator,
  Input,
  PortfolioSelect,
} from "components/index";
import { LabeledDivFlex } from "components/LabeledDiv/LabeledDivFlex";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useUniqueReference } from "hooks/useUniqueReference";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import {
  switchableTag,
  useGetPermittedSecurities,
} from "services/permissions/trading";
import { getBackendTranslation } from "utils/backTranslations";
import { handleNumberInputEvent, handleNumberPasteEvent } from "utils/input";
import { round } from "utils/number";
import { getTradeAmountTooltip } from "utils/trading";
import { addProtocolToUrl } from "utils/url";
import { useTradablePortfolioSelect } from "../useTradablePortfolioSelect";
import useBuySecuritySelector from "./useBuySecuritySelector";
import useSellSecuritySelector from "./useSellSecuritySelector";

export interface SwitchModalInitialData {
  sellSecurityId: number;
}

interface SwitchModalProps extends SwitchModalInitialData {
  sellSecurityId: number;
  modalInitialFocusRef: MutableRefObject<null>;
  onClose: () => void;
}

//place holder empty options
const defaultSellSecurityOption: Option = {
  id: -2,
  label: "",
};
const defaultBuySecurityOption: Option = {
  id: -3,
  label: "",
};

export const SwitchModalContent = ({
  onClose,
  sellSecurityId,
}: SwitchModalProps) => {
  const { access } = useKeycloak();
  const { t, i18n } = useModifiedTranslation();
  const [inputValue, setInputValue] = useState<string>("100");
  const [submitting, setSubmitting] = useState(false);
  const shareToSell = inputValue ? Number(inputValue) : 0;

  const {
    setPortfolioId,
    portfolioOptions: tradablePortfolioOptions,
    portfolioId,
  } = useTradablePortfolioSelect();

  const { selectedContactId } = useGetContractIdData();
  const { data: { portfolios } = { portfolios: [] } } = useGetContactInfo(
    false,
    selectedContactId
  );

  const selectedPortfolio = useMemo(() => {
    return portfolios.find((p) => p.id === portfolioId);
  }, [portfolios, portfolioId]);

  const {
    data: portfolioAllowedSwitchableSecurities,
    loading: loadingSecurities,
  } = useGetPermittedSecurities({ tags: [switchableTag] }, portfolioId);

  const { loading: loadingHoldings, data: portfolioHoldings } =
    useGetPortfolioHoldingsFromPfReport(portfolioId);

  //poll fresh position data from server every 5min
  //goes on for as long as this component is mounted
  const POLL_INTERVAL = 5 * 60 * 1000;
  useGetContactHoldingsFromPfReport(POLL_INTERVAL);

  const selectedPortfolioCurrency = selectedPortfolio?.currency.securityCode;

  //allows indexing into the specific security quicker
  const switchableSecuritiesMap = useMemo(() => {
    return portfolioAllowedSwitchableSecurities?.reduce((prev, currSec) => {
      prev[currSec.id] = currSec;
      return prev;
    }, {} as Record<number, TradableSecurity>);
  }, [portfolioAllowedSwitchableSecurities]);

  //allows indexing into the specific portfolio holding quicker
  const portfolioHoldingsMap = useMemo(() => {
    return portfolioHoldings?.reduce((prev, currHolding) => {
      prev[currHolding.security.id] = currHolding;
      return prev;
    }, {} as Record<number, HoldingPosition>);
  }, [portfolioHoldings]);

  //'from' securities
  const switchablePositionsAsOptions: Option[] | undefined = useMemo(() => {
    return portfolioAllowedSwitchableSecurities?.reduce((prev, currSec) => {
      const securityId = currSec.id as number | null;
      const holding = securityId
        ? portfolioHoldingsMap?.[securityId]
        : undefined;
      if (holding?.marketValue) {
        prev.push({
          id: currSec.id,
          label: `${getBackendTranslation(
            currSec.name,
            currSec.namesAsMap,
            i18n.language
          )} (${currSec.isinCode}) | ${t("numberWithCurrency", {
            value: holding?.marketValue,
            currency: selectedPortfolioCurrency,
          })}`,
        });
      }
      return prev;
    }, [] as Option[]);
  }, [
    portfolioAllowedSwitchableSecurities,
    portfolioHoldingsMap,
    i18n.language,
    t,
    selectedPortfolioCurrency,
  ]);

  const { selectedSellSecurityOption, setSelectedSellSecurityOption } =
    useSellSecuritySelector(
      switchablePositionsAsOptions,
      sellSecurityId,
      defaultSellSecurityOption
    );

  const selectedSellSecurityId = selectedSellSecurityOption?.id as
    | number
    | undefined;
  const selectedSellSecurity = selectedSellSecurityId
    ? switchableSecuritiesMap?.[selectedSellSecurityId]
    : undefined;

  //'to' securities
  const selectableBuySecuritiesAsOptions: Option[] | undefined = useMemo(() => {
    return portfolioAllowedSwitchableSecurities
      ?.filter(
        (s) =>
          !switchablePositionsAsOptions?.length || //no switchable positions --> allow all possible buy securities
          s.id !== selectedSellSecurityId //remove selected position from possible buy securities
      )
      ?.map((s) => ({
        id: s.id,
        label: `${getBackendTranslation(
          s.name,
          s.namesAsMap,
          i18n.language
        )} (${s.isinCode})`,
      }));
  }, [
    i18n.language,
    selectedSellSecurityId,
    switchablePositionsAsOptions?.length,
    portfolioAllowedSwitchableSecurities,
  ]);

  const { selectedBuySecurityOption, setSelectedBuySecurityOption } =
    useBuySecuritySelector(
      selectedSellSecurityId,
      selectableBuySecuritiesAsOptions,
      defaultBuySecurityOption
    );

  const selectedBuySecurityId = selectedBuySecurityOption?.id as number | null;

  const selectedBuySecurity = selectedBuySecurityId
    ? switchableSecuritiesMap?.[selectedBuySecurityId]
    : undefined;

  const selectedSellPosition = selectedSellSecurity?.id
    ? portfolioHoldingsMap?.[selectedSellSecurity?.id]
    : undefined;

  const portfolioCurrency = selectedPortfolio?.currency.securityCode;
  const FALLBACK_BLOCK_SIZE = 2;
  const PORTFOLIO_BLOCK_SIZE =
    selectedPortfolio?.currency.amountDecimalCount || FALLBACK_BLOCK_SIZE;
  const SELL_SECURITY_BLOCK_SIZE =
    selectedSellSecurity?.amountDecimalCount !== undefined
      ? selectedSellSecurity?.amountDecimalCount
      : FALLBACK_BLOCK_SIZE;
  const unitsToSell = selectedSellPosition
    ? round(
        (shareToSell / 100) * selectedSellPosition?.amount,
        SELL_SECURITY_BLOCK_SIZE
      )
    : 0;

  const approximateSellTradeAmountInPfCurrency =
    unitsToSell &&
    selectedSellSecurity?.latestMarketData?.price &&
    selectedSellPosition?.marketFxRate
      ? round(
          unitsToSell *
            (selectedSellSecurity?.latestMarketData?.price /
              selectedSellPosition?.marketFxRate),
          PORTFOLIO_BLOCK_SIZE
        )
      : undefined;

  const loading = loadingHoldings || loadingSecurities;

  const noSwitchablePositions =
    !loading && !switchablePositionsAsOptions?.length;

  const noSelectedPortfolio = !loading && !selectedPortfolio;

  const noSelectedSell =
    !loading && switchablePositionsAsOptions?.length && !selectedSellSecurity
      ? true
      : false;

  const noBuySecurities = !loading && !selectableBuySecuritiesAsOptions?.length;

  const noSecuritySelected =
    switchablePositionsAsOptions?.length &&
    !loading &&
    selectableBuySecuritiesAsOptions?.length &&
    !selectedBuySecurity
      ? true
      : false;

  const inputShareError =
    shareToSell > 100 || shareToSell < 0 || shareToSell === 0 ? " " : "";

  const inputShareErrorBool = inputShareError.length > 0;

  const invalidTradeAmount =
    !loading && !approximateSellTradeAmountInPfCurrency;
  const invalidUnits = !loading && !unitsToSell;

  //disable the confirm button when...
  const disableConfirm = () => {
    return !access.switch ||
      loading ||
      submitting ||
      noSelectedPortfolio ||
      noSwitchablePositions ||
      noSelectedSell ||
      noBuySecurities ||
      noSecuritySelected ||
      inputShareErrorBool ||
      invalidTradeAmount ||
      invalidUnits
      ? true
      : false;
  };

  const tradeAmountTooltip =
    selectedSellSecurity !== undefined && portfolioCurrency !== undefined
      ? getTradeAmountTooltip(
          unitsToSell,
          selectedSellSecurity,
          selectedSellSecurity?.fxRate,
          portfolioCurrency,
          i18n.language,
          t
        )
      : undefined;

  const reference = useUniqueReference()?.();
  const switchOrder: LimitedSwitchOrderDTOInput = {
    sell: {
      executionMethod: ExecutionMethod.UNITS,
      security: selectedSellSecurity?.securityCode,
      parentPortfolio: selectedPortfolio?.shortName ?? "",
      status: OrderStatus.Open,
      amount: unitsToSell,
      autoUnitPrice: true,
      autoFxRate: true,
      account: "DEFAULT",
      transactionDate: new Date().toISOString(),
      type: TransactionType.REDEMPTION,
      tags: access.advisor ? ADVISOR_TAG : undefined,
      reference: `switchSell-${reference}`,
    },
    buy: {
      security: selectedBuySecurity?.securityCode ?? "",
      type: TransactionType.SUBSCRIPTION,
      reference: `switchBuy-${reference}`,
      tags: access.advisor ? ADVISOR_TAG : undefined,
    },
  };

  const { handleCreateSwitch } = useSwitch(switchOrder);

  return (
    <div className="flex flex-col gap-y-2 max-w-sm">
      <PortfolioSelect
        id="switchOrderModal-portfolioSelect"
        error={
          noSelectedPortfolio
            ? t("switchOrderModal.noPortfolioSelectedError")
            : noSwitchablePositions
            ? t("switchOrderModal.noSwitchableHoldingsError")
            : ""
        }
        portfolioOptions={tradablePortfolioOptions}
        portfolioId={portfolioId}
        onChange={(newPortfolio) => setPortfolioId(newPortfolio.id)}
        label={t("switchOrderModal.portfolioSelectLabel")}
      />

      <ComboBox
        loading={!submitting && (loadingSecurities || loadingHoldings)}
        error={noSelectedSell ? t("switchOrderModal.selectSecurityError") : ""}
        id="switchOrderModal-sellSecuritySelect"
        label={t("switchOrderModal.fromSecuritySelectorLabel")}
        value={selectedSellSecurityOption}
        onChange={setSelectedSellSecurityOption}
        options={switchablePositionsAsOptions}
        disabled={noSelectedPortfolio}
      />

      <div className="max-w-[100px]">
        <Input
          id="switchOrderModal-shareInput"
          label={t("switchOrderModal.percentageInputLabel")}
          tooltipContent={
            selectedSellSecurity?.name
              ? t("switchOrderModal.shareInputTooltip", {
                  securityName: selectedSellSecurity?.name,
                })
              : ""
          }
          type="number"
          placeholder={t("switchOrderModal.shareInputPlaceholder")}
          className="w-20"
          value={inputValue}
          onChange={(e) => handleNumberInputEvent(e, setInputValue, 0, 100, 2)}
          onPaste={(e) => handleNumberPasteEvent(e, setInputValue, 0, 100, 2)}
          error={inputShareError}
          step="any"
        />
      </div>
      <div className="flex flex-col gap-y-2 rounded-lg">
        <ComboBox
          loading={loadingSecurities}
          error={
            noBuySecurities
              ? t("switchOrderModal.noSwitchableSecuritiesInSystemError")
              : noSecuritySelected
              ? t("switchOrderModal.selectSecurityError")
              : ""
          }
          id="switchOrderModal-buySecuritySelect"
          label={t("switchOrderModal.toSecuritySelectorLabel")}
          value={selectedBuySecurityOption}
          onChange={setSelectedBuySecurityOption}
          options={selectableBuySecuritiesAsOptions}
          disabled={noSelectedPortfolio}
        />

        {selectedBuySecurity && (
          <div className="flex flex-row flex-wrap gap-x-2 items-end text-sm">
            {selectedBuySecurity.url2 && (
              <>
                <div className="w-fit">
                  <DownloadableDocument
                    id="switchOrderModal-kiid"
                    url={addProtocolToUrl(selectedBuySecurity.url2)}
                    label={t("tradingModal.kiid")}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <>
        <hr className="my-1" />
        <div className="flex flex-col gap-y-1">
          {!submitting && loading ? (
            <LoadingIndicator size="md" center />
          ) : (
            <LabeledDivFlex
              alignText="center"
              tooltipContent={tradeAmountTooltip}
              id="switchOrderModal-tradeAmount"
              label={t("switchOrderModal.approximateTradeAmount")}
              className="text-2xl font-semibold"
            >
              {approximateSellTradeAmountInPfCurrency &&
              selectedPortfolioCurrency
                ? t("numberWithCurrency", {
                    value: approximateSellTradeAmountInPfCurrency,
                    currency: selectedPortfolioCurrency,
                  })
                : "-"}
            </LabeledDivFlex>
          )}
        </div>
      </>
      <Button
        id="switchOrderModal-confirmButton"
        onClick={async () => {
          setSubmitting(true);
          await handleCreateSwitch();
          onClose();
        }}
        disabled={submitting || disableConfirm()}
        isLoading={submitting}
      >
        {t("switchOrderModal.confirmButtonLabel")}
      </Button>
      <div
        id="switchOrderModal-disclaimer"
        className="text-xs text-center text-gray-600 max-w-[375px]"
      >
        {t("switchOrderModal.confirmDisclaimer")}
      </div>
    </div>
  );
};
