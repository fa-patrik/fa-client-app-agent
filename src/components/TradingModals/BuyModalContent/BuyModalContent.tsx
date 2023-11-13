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
import { round, roundDown } from "utils/number";
import {
  getBlockSizeErrorTooltip,
  getBlockSizeMinTradeAmount,
  getTradeAmountTooltip,
} from "utils/trading";
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
  const [submitting, setSubmitting] = useState(false);
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
  const SECURITY_CURRENCY_BLOCK_SIZE =
    security?.currency.amountDecimalCount !== undefined
      ? security?.currency.amountDecimalCount
      : FALLBACK_DECIMAL_COUNT;
  const PORTFOLIO_BLOCK_SIZE =
    portfolioData?.currency.amountDecimalCount !== undefined
      ? portfolioData?.currency.amountDecimalCount
      : FALLBACK_DECIMAL_COUNT;
  const INPUT_BLOCK_SIZE = isTradeInUnits
    ? SECURITY_BLOCK_SIZE
    : PORTFOLIO_BLOCK_SIZE;

  const securityName =
    security !== undefined
      ? getBackendTranslation(
          security?.name,
          security?.namesAsMap,
          i18n.language
        )
      : undefined;

  const securityFxRate = security?.fxRate || 1;
  const securityPrice = security?.latestMarketData?.price;

  const securityPriceInPfCurrency =
    securityPrice !== undefined
      ? round(securityPrice * securityFxRate, PORTFOLIO_BLOCK_SIZE)
      : undefined;

  const unitsToBuyFromTradeAmount =
    securityPriceInPfCurrency !== undefined
      ? inputAsNr / (securityPriceInPfCurrency || 1)
      : undefined;

  const unitsToBuy = isTradeInUnits
    ? roundDown(inputAsNr, SECURITY_BLOCK_SIZE)
    : unitsToBuyFromTradeAmount !== undefined
    ? roundDown(unitsToBuyFromTradeAmount, SECURITY_BLOCK_SIZE)
    : undefined;

  const estimatedTradeAmountInPfCurrency =
    unitsToBuy !== undefined && securityPriceInPfCurrency !== undefined
      ? round(unitsToBuy * securityPriceInPfCurrency, PORTFOLIO_BLOCK_SIZE)
      : undefined;

  const estimatedTradeAmountInSecurityCurrency =
    unitsToBuy !== undefined && securityPrice !== undefined
      ? round(unitsToBuy * securityPrice, SECURITY_CURRENCY_BLOCK_SIZE)
      : undefined;

  const fxRate =
    (estimatedTradeAmountInSecurityCurrency || 0) /
    (estimatedTradeAmountInPfCurrency || 1);

  const { handleTrade: handleBuy } = useTrade({
    tradeType: getTradeType(security?.type.code),
    portfolio: selectedPortfolio || portfolios[0],
    securityName: securityName || "-",
    units: isTradeInUnits ? unitsToBuy : undefined,
    tradeAmount: !isTradeInUnits
      ? estimatedTradeAmountInSecurityCurrency
      : undefined,
    securityCode: security?.securityCode || "",
    executionMethod: isTradeInUnits
      ? ExecutionMethod.UNITS
      : ExecutionMethod.NET_TRADE_AMOUNT,
    fxRate,
  });

  const availableCash =
    portfolioData?.portfolioReport.accountBalanceAdjustedWithOpenTradeOrders;
  const portfolioCurrency = selectedPortfolio?.currency.securityCode;
  const securityCurrency = security?.currency.securityCode;

  const insufficientCash =
    (availableCash || 0) < (estimatedTradeAmountInPfCurrency || 0); // less than trying to buy for

  const { readonly } = useKeycloak();

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

  //min trade amount allowed to trade in this security
  //based on its block size only
  const blockSizeMinTradeAmountInPfCurrency =
    securityPrice !== undefined
      ? round(
          getBlockSizeMinTradeAmount(SECURITY_BLOCK_SIZE, securityPrice) *
            securityFxRate,
          PORTFOLIO_BLOCK_SIZE
        )
      : undefined;

  const blockSizeTradeAmountError =
    !isTradeInUnits &&
    inputAsNr > 0 &&
    security !== undefined &&
    blockSizeMinTradeAmountInPfCurrency !== undefined &&
    portfolioCurrency !== undefined &&
    estimatedTradeAmountInPfCurrency !== undefined &&
    blockSizeMinTradeAmountInPfCurrency > estimatedTradeAmountInPfCurrency //input is lower than min allowed trade amount
      ? getBlockSizeErrorTooltip(
          blockSizeMinTradeAmountInPfCurrency,
          security,
          security.fxRate,
          portfolioCurrency,
          i18n.language,
          t,
          true
        )
      : undefined;

  useEffect(() => {
    //when switching between amount and trade amount
    //we must make sure the input is rounded to the allowed
    //amount of decimals
    setInput((currInput) =>
      currInput ? round(parseFloat(currInput), INPUT_BLOCK_SIZE).toString() : ""
    );
  }, [INPUT_BLOCK_SIZE]);

  const loading = loadingCash || loadingSecurity;

  const disableBuyButton = () => {
    return (
      loading ||
      inputAsNr === 0 ||
      insufficientCash ||
      !!blockSizeTradeAmountError ||
      readonly ||
      !selectedPortfolio ||
      submitting
    );
  };

  return (
    <div className="grid gap-2 min-w-[min(84vw,_375px)]">
      {securityName && (
        <LabeledDiv
          label={t("tradingModal.securityName")}
          className="text-2xl font-semibold"
        >
          {securityName}
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
            INPUT_BLOCK_SIZE
          );
        }}
        onPaste={(event) => {
          handleNumberPasteEvent(
            event,
            setInput,
            0,
            undefined,
            INPUT_BLOCK_SIZE
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
          !input || inputAsNr === 0
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
        <div>
          <LabeledDivFlex
            alignText="center"
            tooltipContent={tradeAmountTooltip || blockSizeTradeAmountError}
            id="buyOrderModal-tradeAmount"
            label={t("tradingModal.approximateTradeAmount")}
            className="text-2xl font-semibold"
          >
            {`${t("number", {
              value: estimatedTradeAmountInPfCurrency || 0,
            })} ${portfolioCurrency} `}
          </LabeledDivFlex>
          {securityCurrency && portfolioCurrency !== securityCurrency && (
            <LabeledDivFlex
              alignText="center"
              id="buyOrderModal-tradeAmount"
              label={""}
              className="text-md"
            >
              (
              {`${t("number", {
                value: estimatedTradeAmountInSecurityCurrency || 0,
              })} ${securityCurrency}`}
              )
            </LabeledDivFlex>
          )}
        </div>
        <Button
          disabled={disableBuyButton()}
          isLoading={submitting}
          onClick={async () => {
            setSubmitting(true);
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
