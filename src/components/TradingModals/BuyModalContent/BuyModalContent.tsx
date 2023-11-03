import { MutableRefObject, useState, useEffect, useMemo } from "react";
import { ExecutionMethod } from "api/enums";
import { SecurityTypeCode } from "api/holdings/types";
import { useGetSecurityDetails } from "api/holdings/useGetSecurityDetails";
import { useGetContactInfo } from "api/initial/useGetContactInfo";
import { useGetBuyData } from "api/trading/useGetBuyData";
import { useTrade } from "api/trading/useTrade";
import {
  PortfolioSelect,
  DownloadableDocument,
  Button,
  Input,
  LabeledDiv,
  LoadingIndicator,
} from "components/index";
import { LabeledDivFlex } from "components/LabeledDiv/LabeledDivFlex";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { getBackendTranslation } from "utils/backTranslations";
import { handleNumberInputEvent, handleNumberPasteEvent } from "utils/input";
import { roundDown } from "utils/number";
import { getBlockSizeErrorTooltip, getTradeAmountTooltip } from "utils/trading";
import { addProtocolToUrl } from "utils/url";
import { useTradablePortfolioSelect } from "../useTradablePortfolioSelect";
import { useGetBuyTradeType } from "./useGetBuyTradeType";

export interface BuyModalInitialData {
  id: number;
}

interface BuyModalProps extends BuyModalInitialData {
  modalInitialFocusRef: MutableRefObject<null>;
  onClose: () => void;
}

export const isSecurityTypeFund = (
  securityType: SecurityTypeCode | undefined
) => securityType === SecurityTypeCode.COLLECTIVE_INVESTMENT_VEHICLE;

const getTradeType = (securityType: SecurityTypeCode | undefined) =>
  isSecurityTypeFund(securityType) ? "subscription" : "buy";

const FALLBACK_DECIMAL_COUNT = 2;

export const BuyModalContent = ({
  modalInitialFocusRef,
  onClose,
  id: securityId,
}: BuyModalProps) => {
  const { t, i18n } = useModifiedTranslation();
  const { selectedContactId } = useGetContractIdData();
  const { data: { portfolios } = { portfolios: [] } } = useGetContactInfo(
    false,
    selectedContactId
  );
  const { setPortfolioId, portfolioOptions, portfolioId } =
    useTradablePortfolioSelect();

  const selectedPortfolioId = portfolioId;
  const selectedPortfolio = useMemo(() => {
    return portfolios.find((p) => p.id === portfolioId);
  }, [portfolios, portfolioId]);

  const { data: security, loading: loadingSecurity } = useGetSecurityDetails(
    securityId.toString(),
    selectedPortfolio?.currency.securityCode
  );

  const { loading: loadingCash, data: portfolioData } =
    useGetBuyData(selectedPortfolioId);

  const { isTradeInUnits, canToggleTradeType, setIsTradeInUnits } =
    useGetBuyTradeType(security?.tagsAsSet, security?.type.code);

  const [input, setInput] = useState<string>("");
  const inputAsNr = input ? Number(input) : 0;

  const SECURITY_BLOCK_SIZE =
    security?.amountDecimalCount !== undefined
      ? security.amountDecimalCount
      : FALLBACK_DECIMAL_COUNT;
  const PORTFOLIO_BLOCK_SIZE =
    portfolioData?.currency.amountDecimalCount !== undefined
      ? portfolioData?.currency.amountDecimalCount
      : FALLBACK_DECIMAL_COUNT;

  const buySecurityName =
    security !== undefined
      ? getBackendTranslation(
          security?.name,
          security?.namesAsMap,
          i18n.language
        )
      : undefined;

  const buySecurityFxRate = security?.fxRate || 1;
  const buySecurityPrice = security?.latestMarketData?.price;
  const buySecurityPriceInPfCurrency =
    buySecurityPrice !== undefined
      ? buySecurityPrice * buySecurityFxRate
      : undefined;
  const unitsToBuyFromTradeAmount =
    buySecurityPriceInPfCurrency !== undefined
      ? inputAsNr / (buySecurityPriceInPfCurrency || 1)
      : undefined;

  const unitsToBuy = isTradeInUnits
    ? roundDown(inputAsNr, SECURITY_BLOCK_SIZE)
    : unitsToBuyFromTradeAmount !== undefined
    ? roundDown(unitsToBuyFromTradeAmount, SECURITY_BLOCK_SIZE)
    : undefined;
  const tradeAmountInPfCurrency =
    unitsToBuy !== undefined && buySecurityPriceInPfCurrency !== undefined
      ? unitsToBuy * buySecurityPriceInPfCurrency
      : undefined;
  const tradeAmount =
    unitsToBuy !== undefined && buySecurityPrice !== undefined
      ? unitsToBuy * buySecurityPrice
      : undefined;

  const { handleTrade: handleBuy, submitting } = useTrade({
    tradeType: getTradeType(security?.type.code),
    portfolio: selectedPortfolio || portfolios[0],
    securityName: buySecurityName || "-",
    units: isTradeInUnits ? unitsToBuy : undefined,
    tradeAmount: !isTradeInUnits ? tradeAmount : undefined,
    securityCode: security?.securityCode || "",
    executionMethod: isTradeInUnits
      ? ExecutionMethod.UNITS
      : ExecutionMethod.NET_TRADE_AMOUNT,
  });

  const availableCash =
    portfolioData?.portfolioReport.accountBalanceAdjustedWithOpenTradeOrders;
  const portfolioCurrency = selectedPortfolio?.currency.securityCode;
  const buySecurityCurrency = security?.currency.securityCode;

  const insufficientCash =
    (availableCash || 0) === 0 ||
    (availableCash || 0) < (tradeAmountInPfCurrency || 0);

  const { readonly } = useKeycloak();

  //all cases except when buying fund with trade amount
  const isTradeAmountAnEstimation = !(
    !isTradeInUnits &&
    security?.type?.code === SecurityTypeCode.COLLECTIVE_INVESTMENT_VEHICLE &&
    portfolioCurrency === buySecurityCurrency
  );

  const tradeAmountTooltip =
    unitsToBuy !== undefined &&
    security !== undefined &&
    portfolioCurrency !== undefined
      ? getTradeAmountTooltip(
          unitsToBuy,
          security,
          security.fxRate,
          portfolioCurrency,
          i18n.language,
          t
        )
      : undefined;

  const blockSizeMinTradeAmountInPfCurrency =
    buySecurityPriceInPfCurrency !== undefined
      ? (1 / 10 ** SECURITY_BLOCK_SIZE) * buySecurityPriceInPfCurrency
      : undefined;

  const blockSizeTradeAmountError =
    !isTradeInUnits &&
    security !== undefined &&
    security?.type.code === SecurityTypeCode.EQUITY &&
    blockSizeMinTradeAmountInPfCurrency !== undefined &&
    portfolioCurrency !== undefined &&
    tradeAmountInPfCurrency !== undefined &&
    !(blockSizeMinTradeAmountInPfCurrency <= tradeAmountInPfCurrency)
      ? getBlockSizeErrorTooltip(
          blockSizeMinTradeAmountInPfCurrency,
          security,
          security.fxRate,
          portfolioCurrency,
          i18n.language,
          t
        )
      : undefined;

  useEffect(() => {
    //when switching between amount and trade amount
    //we must make sure the input is rounded to the allowed
    //amount of decimals
    setInput((currInput) =>
      currInput
        ? roundDown(
            parseFloat(currInput),
            isTradeInUnits ? SECURITY_BLOCK_SIZE : PORTFOLIO_BLOCK_SIZE
          ).toString()
        : ""
    );
  }, [isTradeInUnits, SECURITY_BLOCK_SIZE, PORTFOLIO_BLOCK_SIZE]);

  const loading = loadingSecurity || loadingCash;

  const disableBuyButton = () => {
    return (
      loading ||
      inputAsNr === 0 ||
      insufficientCash ||
      readonly ||
      !selectedPortfolio ||
      !!blockSizeTradeAmountError
    );
  };

  return (
    <div className="grid gap-2 min-w-[min(84vw,_375px)]">
      {buySecurityName && (
        <LabeledDiv
          label={t("tradingModal.securityName")}
          className="text-2xl font-semibold"
        >
          {buySecurityName}
        </LabeledDiv>
      )}
      {loadingSecurity && <LoadingIndicator size="sm" />}
      {security?.url2 && (
        <div className="w-fit">
          <DownloadableDocument
            url={addProtocolToUrl(security?.url2)}
            label={t("tradingModal.kiid")}
          />
        </div>
      )}
      <PortfolioSelect
        portfolioOptions={portfolioOptions}
        portfolioId={portfolioId}
        onChange={(newPortfolio) => setPortfolioId(newPortfolio.id)}
        label={t("tradingModal.portfolio")}
      />
      <LabeledDiv
        label={t("tradingModal.availableCash")}
        className="text-xl font-semibold text-gray-700"
      >
        {!loadingCash &&
          portfolioCurrency &&
          availableCash !== undefined &&
          t("numberWithCurrency", {
            value: availableCash,
            currency: portfolioCurrency,
          })}
        {loadingCash && <LoadingIndicator size="xs" />}
      </LabeledDiv>
      <Input
        disabled={!portfolioId}
        ref={modalInitialFocusRef}
        value={input}
        onChange={(event) => {
          handleNumberInputEvent(
            event,
            setInput,
            0,
            undefined,
            isTradeInUnits ? SECURITY_BLOCK_SIZE : PORTFOLIO_BLOCK_SIZE
          );
        }}
        onPaste={(event) => {
          handleNumberPasteEvent(
            event,
            setInput,
            0,
            undefined,
            isTradeInUnits ? SECURITY_BLOCK_SIZE : PORTFOLIO_BLOCK_SIZE
          );
        }}
        label={
          isTradeInUnits
            ? t("tradingModal.unitsInputLabel")
            : t("tradingModal.tradeAmountInputLabel", {
                currency: portfolioCurrency,
              })
        }
        type="text"
        error={
          !input && !loading
            ? " "
            : blockSizeTradeAmountError !== undefined && !loading
            ? " "
            : insufficientCash && !loading
            ? t("tradingModal.insufficientCashError")
            : ""
        }
      />

      {canToggleTradeType && (
        <>
          <div className="flex overflow-hidden font-medium leading-5 bg-gray-50 rounded-md divide-x ring-1 shadow-sm pointer-events-auto select-none divide-slate-400/20 text-[0.8125rem] ring-slate-700/10">
            <button
              className={`text-center cursor-pointer py-2 px-4 flex-1 ${
                isTradeInUnits ? "bg-gray-200" : ""
              }`}
              onClick={() => setIsTradeInUnits(true)}
            >
              {t("tradingModal.unitsButtonLabel")}
            </button>

            <button
              className={`text-center cursor-pointer py-2 px-4 flex-1 ${
                !isTradeInUnits ? "bg-gray-200" : ""
              }`}
              onClick={() => setIsTradeInUnits(false)}
            >
              {t("tradingModal.tradeAmountButtonLabel")}
            </button>
          </div>
        </>
      )}

      <hr className="my-2" />
      <div className="flex flex-col gap-4 items-stretch ">
        <LabeledDivFlex
          alignText="center"
          tooltipContent={tradeAmountTooltip || blockSizeTradeAmountError}
          id="buyOrderModal-tradeAmount"
          label={
            isTradeAmountAnEstimation
              ? t("tradingModal.approximateTradeAmount")
              : t("tradingModal.tradeAmount")
          }
          className="text-2xl font-semibold"
        >
          {t("numberWithCurrency", {
            value: tradeAmountInPfCurrency || 0,
            currency: portfolioCurrency,
          })}
        </LabeledDivFlex>
        <Button
          disabled={disableBuyButton()}
          isLoading={submitting}
          onClick={async () => {
            const response = await handleBuy();
            if (response) {
              onClose();
            }
          }}
        >
          {t("tradingModal.buyButtonLabel")}
        </Button>
      </div>
      <hr className="my-1" />
      <div className="text-xs text-center text-gray-600 max-w-[375px]">
        {t("tradingModal.buyDisclaimer")}
      </div>
    </div>
  );
};
