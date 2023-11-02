import { MutableRefObject, useEffect, useMemo, useState } from "react";
import { ExecutionMethod, OrderStatus } from "api/enums";
import { HoldingPosition } from "api/holdings/types";
import { useGetContactHoldingsFromPfReport } from "api/holdings/useGetContactHoldingsFromPfReport";
import { useGetPortfolioHoldingsFromPfReport } from "api/holdings/useGetPortfolioHoldingsFromPfReport";
/* import { useGetSecurityFx } from "api/trading/useGetSecurityFx"; */
import {
  TradableSecurity,
  useGetTradebleSecurities,
} from "api/trading/useGetTradebleSecurities";
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
import { useKeycloak } from "providers/KeycloakProvider";
import { switchableTag } from "services/permissions/usePermission";
import { getBackendTranslation } from "utils/backTranslations";
import { findPortfolioOptionById } from "utils/filtering";
import { handleNumberInputEvent, handleNumberPasteEvent } from "utils/input";
import { round } from "utils/number";
import { getTradeAmountTooltip } from "utils/trading";
import { addProtocolToUrl } from "utils/url";
import { useTradablePortfolioSelect } from "../useTradablePortfolioSelect";

export interface SwitchModalInitialData {
  sellSecurityId: number;
}

interface SwitchModalProps extends SwitchModalInitialData {
  sellSecurityId: number;
  modalInitialFocusRef: MutableRefObject<null>;
  onClose: () => void;
}

//place holder options
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
  const { impersonating } = useKeycloak();
  const { t, i18n } = useModifiedTranslation();
  const [inputValue, setInputValue] = useState<string>("100");
  const [submitting, setSubmitting] = useState(false);
  const shareToSell = inputValue ? Number(inputValue) : 0;

  const { data: switchableSecurities, loading: loadingSecurities } =
    useGetTradebleSecurities(undefined, [switchableTag]);

  const {
    setPortfolioId,
    portfolioOptions: tradablePortfolioOptions,
    portfolioId,
  } = useTradablePortfolioSelect();

  const {
    loading: loadingHoldings,
    data: portfolioHoldings,
    /* refetch: refetchPortfolioPositions, */
  } = useGetPortfolioHoldingsFromPfReport(portfolioId);

  //poll fresh position data from server every 5min
  //goes on for as long as this component is mounted
  const POLL_INTERVAL = 5 * 60 * 1000;
  useGetContactHoldingsFromPfReport(POLL_INTERVAL);

  const selectedPortfolio = portfolioId
    ? findPortfolioOptionById(tradablePortfolioOptions, portfolioId)?.details
    : undefined;

  const selectedPortfolioCurrency = selectedPortfolio?.currency.securityCode;

  //allows indexing into the specific security quicker
  const switchableSecuritiesMap = useMemo(() => {
    return switchableSecurities?.reduce((prev, currSec) => {
      prev[currSec.id] = currSec;
      return prev;
    }, {} as Record<number, TradableSecurity>);
  }, [switchableSecurities]);

  //allows indexing into the specific portfolio holding quicker
  const portfolioHoldingsMap = useMemo(() => {
    return portfolioHoldings?.reduce((prev, currHolding) => {
      prev[currHolding.security.id] = currHolding;
      return prev;
    }, {} as Record<number, HoldingPosition>);
  }, [portfolioHoldings]);

  //'from' securities
  const switchablePositionsAsOptions: Option[] | undefined = useMemo(() => {
    return switchableSecurities?.reduce((prev, currSec) => {
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
    switchableSecurities,
    portfolioHoldingsMap,
    i18n.language,
    t,
    selectedPortfolioCurrency,
  ]);

  const [selectedSellSecurityOption, setSelectedSellSecurityOption] = useState<
    Option | undefined
  >(() => switchablePositionsAsOptions?.find((s) => s.id === sellSecurityId));
  const selectedSellSecurityId = selectedSellSecurityOption?.id as
    | number
    | null;
  const selectedSellSecurity = selectedSellSecurityId
    ? switchableSecuritiesMap?.[selectedSellSecurityId]
    : undefined;

  //'to' securities
  const selectableBuySecuritiesAsOptions: Option[] | undefined = useMemo(() => {
    return switchableSecurities
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
    switchableSecurities,
  ]);

  const [selectedBuySecurityOption, setSelectedToSecurityOption] =
    useState<Option>(defaultBuySecurityOption);
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

  //get fx rate security to buy --> portfolio currency
  /* const { data: buySecurityFxData, loading: loadingSecurityFx } =
    useGetSecurityFx(
      selectedBuySecurity?.currency.securityCode,
      portfolioCurrency
    ); */

  /* const buySecurityToPortfolioFx = buySecurityFxData?.[0]?.fxRate; */

  /* const buySecurityMinTradeAmountInPfCurrency =
    buySecurityToPortfolioFx &&
    selectedBuySecurity?.minTradeAmount &&
    selectedBuySecurity?.minTradeAmount * buySecurityToPortfolioFx; */

  /* //there is no min trade amount or the sell trade amount is larger
  const isBuyMinTradeAmountSatisfied =
    !selectedBuySecurity?.minTradeAmount ||
    (approximateSellTradeAmountInPfCurrency || 0) >=
      (buySecurityMinTradeAmountInPfCurrency || 0); */

  //validate and update the sell security
  useEffect(() => {
    //set the security that the modal launched with if no selected security
    if (switchablePositionsAsOptions?.length && !selectedSellSecurityOption) {
      setSelectedSellSecurityOption(
        switchablePositionsAsOptions.find((o) => o.id === sellSecurityId) ||
          defaultSellSecurityOption
      );
      //the currently selected security is not part of portfolio holdings
    } else if (
      selectedSellSecurityOption?.id &&
      portfolioHoldingsMap &&
      !(selectedSellSecurityOption?.id in portfolioHoldingsMap)
    ) {
      //empty the selector
      setSelectedSellSecurityOption(defaultSellSecurityOption);
    } else if (
      //refresh the already selected security
      selectedSellSecurityOption?.id &&
      portfolioHoldingsMap &&
      selectedSellSecurityOption?.id in portfolioHoldingsMap
    ) {
      //set an updated option since the currently selected one might include
      //the prev selected portfolio's market value
      const updatedOption = switchablePositionsAsOptions?.find(
        (o) => o.id === selectedSellSecurityOption?.id
      );
      setSelectedSellSecurityOption(updatedOption || defaultSellSecurityOption);
    }
  }, [
    switchablePositionsAsOptions,
    portfolioHoldingsMap,
    selectedSellSecurityOption,
    sellSecurityId,
  ]);

  //validate and update the to security
  useEffect(() => {
    if (selectedSellSecurityId === selectedBuySecurityOption?.id) {
      //if the selected buy is one of the portfolio's positions --> default the selector
      setSelectedToSecurityOption(defaultBuySecurityOption);
    }
  }, [selectedBuySecurityOption?.id, selectedSellSecurityId]);

  //const loadingRefetchOfHoldings = networkStatus === 4;

  const loading =
    loadingHoldings || loadingSecurities; /* || loadingSecurityFx */

  const portfolioSelectError =
    !loading && !switchablePositionsAsOptions?.length;

  const sellPositionSelectError =
    !loading && switchablePositionsAsOptions?.length && !selectedSellSecurity
      ? true
      : false;

  const noBuySecuritiesError =
    !loading && !selectableBuySecuritiesAsOptions?.length;

  const noBuySecuritySelectedError =
    !loading && selectableBuySecuritiesAsOptions?.length && !selectedBuySecurity
      ? true
      : false;

  const buySecuritySelectError =
    noBuySecuritiesError || noBuySecuritySelectedError;

  const inputShareError =
    shareToSell > 100 || shareToSell < 0 || shareToSell === 0 ? " " : "";

  const inputShareErrorBool = inputShareError.length > 0;

  /* const minTradeAmountError = !loading && !isBuyMinTradeAmountSatisfied; */
  const tradeAmountError = !loading && !approximateSellTradeAmountInPfCurrency;
  const unitsToSellError = !loading && !unitsToSell;

  //disable the confirm button when...
  const disableConfirm = () => {
    return impersonating ||
      loading ||
      submitting ||
      portfolioSelectError ||
      sellPositionSelectError ||
      buySecuritySelectError ||
      inputShareErrorBool ||
      /* minTradeAmountError || */
      tradeAmountError ||
      unitsToSellError
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

  const getUniqueReference = useUniqueReference();
  const reference = getUniqueReference();

  const switchOrder: LimitedSwitchOrderDTOInput = {
    sell: {
      executionMethod: ExecutionMethod.UNITS,
      security: selectedSellSecurity?.securityCode,
      parentPortfolio: selectedPortfolio?.shortName || "",
      status: OrderStatus.Open,
      amount: unitsToSell,
      autoUnitPrice: true,
      account: "DEFAULT",
      transactionDate: new Date().toISOString(),
      type: TransactionType.REDEMPTION,
      reference: `switchSell-${reference}`,
    },
    buy: {
      security: selectedBuySecurity?.securityCode || "",
      type: TransactionType.SUBSCRIPTION,
      reference: `switchBuy-${reference}`,
    },
  };

  const { handleCreateSwitch } = useSwitch(switchOrder);

  return (
    <div className="flex flex-col gap-y-2 min-w-[min(84vw,_375px)]">
      <PortfolioSelect
        id="switchOrderModal-portfolioSelect"
        error={
          portfolioSelectError
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
        error={
          sellPositionSelectError
            ? t("switchOrderModal.selectSecurityError")
            : ""
        }
        id="switchOrderModal-sellSecuritySelect"
        label={t("switchOrderModal.fromSecuritySelectorLabel")}
        value={selectedSellSecurityOption}
        onChange={setSelectedSellSecurityOption}
        options={switchablePositionsAsOptions}
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
        />
      </div>
      <div className="flex flex-col gap-y-2 rounded-lg">
        <ComboBox
          loading={loadingSecurities}
          error={
            noBuySecuritiesError
              ? t("switchOrderModal.noSwitchableSecuritiesInSystemError")
              : noBuySecuritySelectedError
              ? t("switchOrderModal.selectSecurityError")
              : ""
          }
          id="switchOrderModal-buySecuritySelect"
          label={t("switchOrderModal.toSecuritySelectorLabel")}
          value={selectedBuySecurityOption}
          onChange={setSelectedToSecurityOption}
          options={selectableBuySecuritiesAsOptions}
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
            {/*  {selectedBuySecurity.minTradeAmount > 0 && (
              <div className="text-gray-700 w-fit">
                <span>{t("switchOrderModal.minTradeAmount")} </span>
                <span id="switchOrderModal-minTradeAmount">
                  {t("numberWithCurrency", {
                    value: selectedBuySecurity?.minTradeAmount,
                    currency: selectedBuySecurity?.currency.securityCode,
                  })}
                </span>
              </div>
            )} */}
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
              /*  error={
                minTradeAmountError
                  ? t("switchOrderModal.minTradeAmountError", {
                      minTradeAmount: t("numberWithCurrency", {
                        value: buySecurityMinTradeAmountInPfCurrency,
                        currency: portfolioCurrency,
                      }),
                    })
                  : ""
              } */
              alignText="center"
              tooltipContent={tradeAmountTooltip}
              id="switchOrderModal-tradeAmount"
              label={t("switchOrderModal.approximateTradeAmount")}
              className="text-2xl font-semibold"
            >
              {t("numberWithCurrency", {
                value: approximateSellTradeAmountInPfCurrency || 0,
                currency: selectedPortfolioCurrency,
              })}
            </LabeledDivFlex>
          )}
        </div>
      </>
      <hr className="my-1" />
      <Button
        id="switchOrderModal-confirmButton"
        onClick={async () => {
          setSubmitting(true);
          await handleCreateSwitch();
          //update portfolio position figures after new orders
          //nice thing to have in the future when
          //the api returns the updated tradable units
          //await refetchPortfolioPositions();
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
