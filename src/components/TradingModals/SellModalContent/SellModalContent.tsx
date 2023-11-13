import { MutableRefObject, useEffect, useMemo, useState } from "react";
import { ExecutionMethod } from "api/enums";
import { SecurityTypeCode } from "api/holdings/types";
import { useGetPortfolioHoldingFromPfReport } from "api/holdings/useGetPortfolioHoldingFromPfReport";
import { useGetContactInfo } from "api/initial/useGetContactInfo";
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
import Toggle from "components/Toggle/Toggle";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { getBackendTranslation } from "utils/backTranslations";
import { handleNumberInputEvent } from "utils/input";
import { round, roundDown } from "utils/number";
import {
  getBlockSizeErrorTooltip,
  getBlockSizeMinTradeAmount,
  getTradeAmountTooltip,
} from "utils/trading";
import { addProtocolToUrl } from "utils/url";
import { useGetSecurityDetails } from "../../../api/holdings/useGetSecurityDetails";
import { useTradablePortfolioSelect } from "../useTradablePortfolioSelect";
import { useGetSellTradeType } from "./useGetSellTradeType";

export interface SellModalInitialData {
  id: number;
}

interface SellModalProps extends SellModalInitialData {
  modalInitialFocusRef: MutableRefObject<null>;
  onClose: () => void;
}

const FALLBACK_DECIMAL_COUNT = 2;

const getUnitsToSell = (
  isTradeInUnits: boolean,
  isPercentageMode: boolean,
  inputAsNr: number,
  securityPriceInPfCurrency: number,
  units: number,
  SECURITY_BLOCK_SIZE: number
) => {
  if (isPercentageMode) {
    return roundDown((inputAsNr / 100) * units, SECURITY_BLOCK_SIZE);
  } else {
    if (isTradeInUnits) {
      return roundDown(inputAsNr, SECURITY_BLOCK_SIZE);
    } else {
      return roundDown(
        inputAsNr / (securityPriceInPfCurrency || 1),
        SECURITY_BLOCK_SIZE
      );
    }
  }
};

export const isSecurityTypeFund = (
  securityType: SecurityTypeCode | undefined
) => securityType === SecurityTypeCode.COLLECTIVE_INVESTMENT_VEHICLE;

const getTradeType = (securityType: SecurityTypeCode | undefined) =>
  isSecurityTypeFund(securityType) ? "redemption" : "sell";

export const SellModalContent = ({
  modalInitialFocusRef,
  onClose,
  id: securityId,
}: SellModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [isPercentageMode, setIsPercentageMode] = useState(false);
  const [input, setInput] = useState("");
  const inputAsNr = input ? parseFloat(input) : 0;

  const { t, i18n } = useModifiedTranslation();
  const { selectedContactId } = useGetContractIdData();
  const { data: { portfolios } = { portfolios: [] } } = useGetContactInfo(
    false,
    selectedContactId
  );
  const { portfolioId, setPortfolioId, portfolioOptions } =
    useTradablePortfolioSelect();

  const selectedPortfolioId = portfolioId;
  const {
    loading: loadingPfReport,
    data: { marketValue, amount: units } = {},
  } = useGetPortfolioHoldingFromPfReport(
    selectedPortfolioId,
    securityId.toString()
  );

  const selectedPortfolio = useMemo(
    () => portfolios.find((p) => p.id === portfolioId),
    [portfolioId, portfolios]
  );
  const portfolioCurrency = selectedPortfolio?.currency.securityCode;

  const { data: security, loading: loadingSecurity } = useGetSecurityDetails(
    securityId.toString(),
    portfolioCurrency
  );

  const { isTradeInUnits, canToggleTradeType, setIsTradeInUnits } =
    useGetSellTradeType(security?.tagsAsSet, security?.type.code);

  const PORTFOLIO_BLOCK_SIZE =
    selectedPortfolio?.currency.amountDecimalCount !== undefined
      ? selectedPortfolio?.currency.amountDecimalCount
      : FALLBACK_DECIMAL_COUNT;
  const SECURITY_BLOCK_SIZE =
    security?.amountDecimalCount !== undefined
      ? security?.amountDecimalCount
      : FALLBACK_DECIMAL_COUNT;
  const SECURITY_CURRENCY_BLOCK_SIZE =
    security?.currency.amountDecimalCount !== undefined
      ? security?.currency.amountDecimalCount
      : FALLBACK_DECIMAL_COUNT;
  const PERCENTAGE_BLOCK_SIZE = FALLBACK_DECIMAL_COUNT;

  const securityCurrency = security?.currency.securityCode;
  const securityFxRate = security?.fxRate || 1;
  const securityPrice = security?.latestMarketData?.price;
  const securityPriceInPfCurrency =
    securityPrice !== undefined
      ? round(securityPrice * securityFxRate, PORTFOLIO_BLOCK_SIZE)
      : undefined;

  const unitsToSell =
    securityPriceInPfCurrency !== undefined && units !== undefined
      ? getUnitsToSell(
          isTradeInUnits,
          isPercentageMode,
          inputAsNr,
          securityPriceInPfCurrency,
          units,
          SECURITY_BLOCK_SIZE
        )
      : undefined;

  const estimatedTradeAmountInPfCurrency =
    unitsToSell !== undefined && securityPriceInPfCurrency !== undefined
      ? round(unitsToSell * securityPriceInPfCurrency, PORTFOLIO_BLOCK_SIZE)
      : undefined;

  const estimatedTradeAmountInSecurityCurrency =
    unitsToSell !== undefined && securityPrice !== undefined
      ? round(unitsToSell * securityPrice, SECURITY_CURRENCY_BLOCK_SIZE)
      : undefined;

  const fxRate =
    (estimatedTradeAmountInSecurityCurrency || 0) /
    (estimatedTradeAmountInPfCurrency || 1);

  const securityName =
    security !== undefined
      ? getBackendTranslation(
          security?.name,
          security?.namesAsMap,
          i18n.language
        )
      : "-";

  const { handleTrade: handleSell } = useTrade({
    tradeType: getTradeType(security?.type.code),
    portfolio:
      portfolios.find((portfolio) => portfolio.id === portfolioId) ||
      portfolios[0],
    securityName,
    units: isTradeInUnits ? unitsToSell : undefined,
    tradeAmount: !isTradeInUnits
      ? estimatedTradeAmountInSecurityCurrency
      : undefined,
    securityCode: security?.securityCode || "",
    executionMethod: isTradeInUnits
      ? ExecutionMethod.UNITS
      : ExecutionMethod.NET_TRADE_AMOUNT,
    fxRate,
  });

  const { readonly } = useKeycloak();

  const loading = loadingPfReport && loadingSecurity;

  const tradeAmountTooltip =
    unitsToSell !== undefined &&
    security !== undefined &&
    portfolioCurrency !== undefined
      ? getTradeAmountTooltip(
          unitsToSell,
          security,
          securityFxRate,
          portfolioCurrency,
          i18n.language,
          t
        )
      : undefined;

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
    blockSizeMinTradeAmountInPfCurrency > estimatedTradeAmountInPfCurrency
      ? getBlockSizeErrorTooltip(
          blockSizeMinTradeAmountInPfCurrency,
          security,
          security.fxRate,
          portfolioCurrency,
          i18n.language,
          t,
          false
        )
      : undefined;

  const emptyPortfolio = units === undefined || units === 0;

  const insufficientFunds =
    unitsToSell !== undefined && units !== undefined && unitsToSell > units;

  //however many decimals to round the input to
  const INPUT_BLOCK_SIZE = isPercentageMode
    ? PERCENTAGE_BLOCK_SIZE
    : isTradeInUnits
    ? SECURITY_BLOCK_SIZE
    : PORTFOLIO_BLOCK_SIZE;

  useEffect(() => {
    //when switching between amount and trade amount
    //we must make sure the input is rounded properly
    setInput((currInput) => {
      return currInput
        ? round(parseFloat(currInput), INPUT_BLOCK_SIZE).toString()
        : "";
    });
  }, [INPUT_BLOCK_SIZE]);

  const disableSellButton = () => {
    return (
      readonly ||
      inputAsNr === 0 ||
      loading ||
      !portfolioId ||
      insufficientFunds ||
      !!blockSizeTradeAmountError ||
      emptyPortfolio ||
      submitting
    );
  };

  return (
    <div className="grid gap-2 min-w-[min(84vw,_375px)]">
      {!loadingSecurity && securityName && (
        <LabeledDiv
          label={t("tradingModal.securityName")}
          className="text-2xl font-semibold"
        >
          {securityName ?? "-"}
        </LabeledDiv>
      )}
      {loadingSecurity && <LoadingIndicator size="sm" />}

      {security?.url2 && (
        <div className="w-fit">
          <DownloadableDocument
            url={addProtocolToUrl(security.url2)}
            label={t("tradingModal.kiid")}
          />
        </div>
      )}
      <div className="z-10">
        <PortfolioSelect
          portfolioOptions={portfolioOptions}
          portfolioId={portfolioId}
          onChange={(newPortfolio) => setPortfolioId(newPortfolio.id)}
          label={t("tradingModal.portfolio")}
        />
      </div>
      {!loadingPfReport && isTradeInUnits && (
        <LabeledDiv
          label={t("tradingModal.currentUnits")}
          className="text-xl font-semibold text-gray-700"
        >
          {portfolioCurrency !== undefined && units !== undefined
            ? t("number", { value: units })
            : "-"}
        </LabeledDiv>
      )}

      {!loadingPfReport && !isTradeInUnits && (
        <LabeledDiv
          label={t("tradingModal.currentMarketValue")}
          className="text-xl font-semibold text-gray-700"
        >
          {marketValue !== undefined && portfolioCurrency !== undefined
            ? t("numberWithCurrency", {
                value: marketValue,
                currency: portfolioCurrency,
              })
            : "-"}
        </LabeledDiv>
      )}
      {loadingPfReport && <LoadingIndicator size="sm" />}
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
        label={
          isPercentageMode && isTradeInUnits
            ? t("tradingModal.shareOfUnitsInputLabel")
            : isPercentageMode && !isTradeInUnits
            ? t("tradingModal.shareOfTradeAmountInputLabel")
            : isTradeInUnits
            ? t("tradingModal.unitsInputLabel")
            : t("tradingModal.tradeAmountInputLabel", {
                currency: portfolioCurrency,
              })
        }
        type="text"
        error={
          !input || inputAsNr === 0
            ? " "
            : insufficientFunds && isTradeInUnits
            ? t("tradingModal.insufficientUnitsError")
            : insufficientFunds && !isTradeInUnits
            ? t("tradingModal.insufficientMarketValueError")
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
              onClick={() => {
                setIsTradeInUnits(true);
              }}
            >
              {t("tradingModal.unitsButtonLabel")}
            </button>

            <button
              className={`text-center cursor-pointer py-2 px-4 flex-1 ${
                !isTradeInUnits ? "bg-gray-200" : ""
              }`}
              onClick={() => {
                setIsTradeInUnits(false);
              }}
            >
              {t("tradingModal.tradeAmountButtonLabel")}
            </button>
          </div>
        </>
      )}

      <div className="flex justify-between items-end h-8">
        <div className="flex gap-1 items-center">
          <Button
            size="xs"
            variant="Secondary"
            onClick={() => {
              if (isPercentageMode) {
                setInput(() => "100");
              } else {
                if (isTradeInUnits && units !== undefined) {
                  return setInput(() =>
                    roundDown(units, SECURITY_BLOCK_SIZE).toString()
                  );
                }
                if (!isTradeInUnits && marketValue !== undefined) {
                  return setInput(() =>
                    roundDown(marketValue, PORTFOLIO_BLOCK_SIZE).toString()
                  );
                }
              }
            }}
          >
            {t("tradingModal.sellAll")}
          </Button>

          <Button
            size="xs"
            variant="Secondary"
            onClick={() => {
              if (isPercentageMode) {
                setInput(() => "50");
              } else {
                if (isTradeInUnits && units !== undefined) {
                  return setInput(() =>
                    roundDown(units / 2, SECURITY_BLOCK_SIZE).toString()
                  );
                }
                if (!isTradeInUnits && marketValue !== undefined) {
                  return setInput(() =>
                    roundDown(marketValue / 2, PORTFOLIO_BLOCK_SIZE).toString()
                  );
                }
              }
            }}
          >
            {t("tradingModal.sellHalf")}
          </Button>
        </div>
        <div className="flex z-0 justify-center items-center text-sm rounded-lg select-none">
          <Toggle
            enabled={isPercentageMode}
            setEnabled={setIsPercentageMode}
            label="%"
          />
        </div>
      </div>

      <hr />
      <div className="flex flex-col gap-4 items-stretch ">
        <div>
          <LabeledDivFlex
            alignText="center"
            tooltipContent={tradeAmountTooltip || blockSizeTradeAmountError}
            id="sellOrderModal-tradeAmount"
            label={t("tradingModal.approximateTradeAmount")}
            className="text-2xl font-semibold"
          >
            {t("numberWithCurrency", {
              value: estimatedTradeAmountInPfCurrency || 0,
              currency: portfolioCurrency,
            })}
          </LabeledDivFlex>
          {securityCurrency && portfolioCurrency !== securityCurrency && (
            <LabeledDivFlex
              alignText="center"
              id="buyOrderModal-tradeAmount"
              label={""}
              className="text-md"
            >
              (
              {t("numberWithCurrency", {
                value: estimatedTradeAmountInSecurityCurrency || 0,
                currency: securityCurrency,
              })}
              )
            </LabeledDivFlex>
          )}
        </div>
        <Button
          disabled={disableSellButton()}
          isLoading={submitting}
          onClick={async () => {
            setSubmitting(true);
            const response = await handleSell();
            if (response) {
              onClose();
            }
          }}
        >
          {t("tradingModal.sellModalHeader")}
        </Button>
      </div>
    </div>
  );
};
