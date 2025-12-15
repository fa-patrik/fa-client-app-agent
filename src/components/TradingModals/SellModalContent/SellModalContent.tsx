import type { MutableRefObject } from "react";
import { useEffect, useMemo, useState } from "react";
import type { Portfolio } from "api/common/useGetContactInfo";
import { useGetContactInfo } from "api/common/useGetContactInfo";
import { ExecutionMethod } from "api/enums";
import { SecurityTypeCode } from "api/holdings/types";
import { useGetSecurityFx } from "api/trading/useGetSecurityFx";
import { useGetSellData } from "api/trading/useGetSellData";
import { useTrade } from "api/trading/useTrade";
import {
  PortfolioSelect,
  DownloadableDocument,
  Button,
  Input,
  LabeledDiv,
} from "components/index";
import { LabeledDivFlex } from "components/LabeledDiv/LabeledDivFlex";
import Toggle from "components/Toggle/Toggle";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { getBackendTranslation } from "utils/backTranslations";
import { getNumberOfOptions } from "utils/faBackProfiles/common";
import { handleNumberInputEvent } from "utils/input";
import { round, roundDown } from "utils/number";
import {
  getBlockSizeErrorTooltip,
  getBlockSizeMinTradeAmount,
  getTradeAmountTooltip,
} from "utils/trading";
import { addProtocolToUrl } from "utils/url";
import { useGetSecurityDetails } from "../../../api/holdings/useGetSecurityDetails";
import PortfolioLock from "../PortfolioLock";
import TradeTypeToggleButtons from "../TradeTypeToggleButtons";
import { useTradablePortfolioSelect } from "../useTradablePortfolioSelect";
import { useGetSellTradeType } from "./useGetSellTradeType";

export interface SellModalInitialData {
  id: number;
  name: string;
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
  securityAmountDecimalCount: number
) => {
  if (isPercentageMode) {
    return roundDown((inputAsNr / 100) * units, securityAmountDecimalCount);
  } else {
    if (isTradeInUnits) {
      return roundDown(inputAsNr, securityAmountDecimalCount);
    } else {
      return roundDown(
        inputAsNr / (securityPriceInPfCurrency || 1),
        securityAmountDecimalCount
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
  name,
}: SellModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [isPercentageMode, setIsPercentageMode] = useState(false);
  const [input, setInput] = useState("");
  const inputAsNr = input ? parseFloat(input) : 0;

  const { t, i18n } = useModifiedTranslation();

  const { data: security, loading: loadingSecurity } = useGetSecurityDetails(
    securityId.toString()
  );

  const { selectedContactId } = useGetContractIdData();
  const { data: { portfolios } = { portfolios: [] } } = useGetContactInfo(
    false,
    selectedContactId
  );

  const {
    setPortfolioId,
    portfolioOptions: portfolioOptionsThatCanTradeTheSecurity,
    portfolioId,
  } = useTradablePortfolioSelect(security?.groups);
  const { portfolioOptions: portfolioOptionsThatCanTrade } =
    useTradablePortfolioSelect();

  const selectedPortfolioId = portfolioId;

  const selectedPortfolio = useMemo(
    () => portfolios.find((p) => p.id === portfolioId),
    [portfolioId, portfolios]
  );

  const portfolioCurrency = selectedPortfolio?.currency.securityCode;

  const { data: securityFxData, loading: securityFxLoading } = useGetSecurityFx(
    security?.securityCode,
    portfolioCurrency
  );

  const securityFx = securityFxData?.[0].fxRate || 1;

  const { loading: loadingPfReport, data: sellData } = useGetSellData(
    selectedPortfolioId,
    security?.currency.securityCode
  );

  const holding = sellData?.portfolio?.portfolioReport?.holdingPositions.find(
    (h) => h?.security?.id === securityId
  );
  const marketValue = holding?.marketValue;
  const units = holding?.amount;

  const defaultAccount =
    sellData?.portfolio?.accounts?.find(
      (a) =>
        a?.currency?.securityCode ===
        sellData?.portfolio?.currency?.securityCode
    ) || sellData?.portfolio?.accounts?.[0];

  const accountToSecurityFxRate = 1 / (defaultAccount?.currency?.fxRate || 1);

  const { isTradeInUnits, canToggleTradeType, setIsTradeInUnits } =
    useGetSellTradeType(security?.tagsAsSet, security?.type.code);

  const portfolioCurrencyAmountDecimalCount =
    selectedPortfolio?.currency.amountDecimalCount !== undefined
      ? selectedPortfolio?.currency.amountDecimalCount
      : FALLBACK_DECIMAL_COUNT;
  const securityAmountDecimalCount =
    security?.amountDecimalCount !== undefined
      ? security?.amountDecimalCount
      : FALLBACK_DECIMAL_COUNT;
  const securityCurrencyAmountDecimalCount =
    security?.currency.amountDecimalCount !== undefined
      ? security?.currency.amountDecimalCount
      : FALLBACK_DECIMAL_COUNT;
  const accountCurrencyAmountDecimalCount =
    defaultAccount?.currency.amountDecimalCount !== undefined
      ? defaultAccount?.currency.amountDecimalCount
      : FALLBACK_DECIMAL_COUNT;
  const percentagDecimalCount = FALLBACK_DECIMAL_COUNT;

  const securityCurrency = security?.currency.securityCode;
  const securityToPortfolioFxRate = securityFx || 1;
  const securityPrice = security?.latestMarketData?.price;
  const securityPriceInPfCurrency =
    securityPrice !== undefined
      ? round(
          securityPrice * securityToPortfolioFxRate,
          portfolioCurrencyAmountDecimalCount
        )
      : undefined;
  const securityPriceInAccCurrency =
    securityPrice !== undefined
      ? round(
          securityPrice * accountToSecurityFxRate,
          portfolioCurrencyAmountDecimalCount
        )
      : undefined;

  const unitsToSell =
    securityPriceInPfCurrency !== undefined && units !== undefined
      ? getUnitsToSell(
          isTradeInUnits,
          isPercentageMode,
          inputAsNr,
          securityPriceInPfCurrency,
          units,
          securityAmountDecimalCount
        )
      : undefined;

  const estimatedTradeAmountInPfCurrency =
    unitsToSell !== undefined && securityPriceInPfCurrency !== undefined
      ? round(
          unitsToSell * securityPriceInPfCurrency,
          portfolioCurrencyAmountDecimalCount
        )
      : undefined;

  const estimatedTradeAmountInSecurityCurrency =
    unitsToSell !== undefined && securityPrice !== undefined
      ? round(unitsToSell * securityPrice, securityCurrencyAmountDecimalCount)
      : undefined;

  const estimatedTradeAmountInAccountCurrency =
    unitsToSell !== undefined && securityPriceInAccCurrency !== undefined
      ? round(
          unitsToSell * securityPriceInAccCurrency,
          accountCurrencyAmountDecimalCount
        )
      : undefined;

  const calculatedReportfxRate =
    (estimatedTradeAmountInSecurityCurrency || 0) /
    (estimatedTradeAmountInPfCurrency || 1);

  const calculatedAccountFxRate =
    (estimatedTradeAmountInSecurityCurrency || 0) /
    (estimatedTradeAmountInAccountCurrency || 1);

  const securityNameTranslated =
    security !== undefined
      ? getBackendTranslation(
          security?.name,
          security?.namesAsMap,
          i18n.language,
          i18n.resolvedLanguage
        )
      : undefined;

  const { handleTrade: handleSell } = useTrade({
    tradeType: getTradeType(security?.type.code),
    portfolio: selectedPortfolio ?? ({} as Portfolio),
    securityName: securityNameTranslated ?? name,
    units: isTradeInUnits ? unitsToSell : undefined,
    tradeAmount: !isTradeInUnits
      ? estimatedTradeAmountInSecurityCurrency
      : undefined,
    securityCode: security?.securityCode || "",
    executionMethod: isTradeInUnits
      ? ExecutionMethod.UNITS
      : ExecutionMethod.NET_TRADE_AMOUNT,
    reportFxRate: calculatedReportfxRate,
    accountFxRate: calculatedAccountFxRate,
  });

  const { access } = useKeycloak();

  const loading = loadingPfReport && loadingSecurity && securityFxLoading;

  const tradeAmountTooltip =
    unitsToSell !== undefined &&
    security !== undefined &&
    portfolioCurrency !== undefined
      ? getTradeAmountTooltip(
          unitsToSell,
          security,
          securityToPortfolioFxRate,
          portfolioCurrency,
          i18n.language,
          i18n.resolvedLanguage,
          t
        )
      : undefined;

  const blockSizeMinTradeAmountInPfCurrency =
    securityPrice !== undefined
      ? round(
          getBlockSizeMinTradeAmount(
            securityAmountDecimalCount,
            securityPrice
          ) * securityToPortfolioFxRate,
          portfolioCurrencyAmountDecimalCount
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
          securityFx,
          portfolioCurrency,
          i18n.language,
          i18n.resolvedLanguage,
          t,
          false
        )
      : undefined;

  const emptyPortfolio = units === undefined || units === 0;

  const insufficientFunds =
    unitsToSell !== undefined && units !== undefined && unitsToSell > units;

  //however many decimals to round the input to
  const INPUT_BLOCK_SIZE = isPercentageMode
    ? percentagDecimalCount
    : isTradeInUnits
      ? securityAmountDecimalCount
      : portfolioCurrencyAmountDecimalCount;

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
      !access.sell ||
      inputAsNr === 0 ||
      loading ||
      !portfolioId ||
      insufficientFunds ||
      !!blockSizeTradeAmountError ||
      emptyPortfolio ||
      submitting
    );
  };

  const areSomePortfoliosProhibitedToTradeTheSecurity =
    getNumberOfOptions(portfolioOptionsThatCanTradeTheSecurity) !==
    getNumberOfOptions(portfolioOptionsThatCanTrade);

  return (
    <div className="grid gap-2 max-w-md min-w-[min(84vw,375px)]">
      <div className="h-20">
        <LabeledDiv
          label={t("tradingModal.securityName")}
          className="text-2xl font-semibold"
        >
          {securityNameTranslated ?? name ?? "-"}
        </LabeledDiv>

        {security?.url2 && (
          <div className="w-fit">
            <DownloadableDocument
              url={addProtocolToUrl(security.url2)}
              label={t("tradingModal.kiid")}
            />
          </div>
        )}
      </div>

      <div className="z-10">
        <PortfolioSelect
          portfolioOptions={portfolioOptionsThatCanTradeTheSecurity}
          portfolioId={portfolioId}
          onChange={(newPortfolio) => {
            if (newPortfolio) {
              setPortfolioId(newPortfolio.id);
            }
          }}
          label={t("tradingModal.portfolio")}
          error={!portfolioId ? t("tradingModal.selectPortfolioError") : ""}
        />
      </div>
      {areSomePortfoliosProhibitedToTradeTheSecurity && <PortfolioLock />}
      <div className="h-14 ">
        {isTradeInUnits && (
          <LabeledDiv
            label={t("tradingModal.currentUnits")}
            className="text-xl font-semibold text-gray-700"
          >
            {units !== undefined ? t("number", { value: units }) : "-"}
          </LabeledDiv>
        )}

        {!isTradeInUnits && (
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
      </div>

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
                : t("tradingModal.tradeAmountSimpleInputLabel")
        }
        type="number"
        error={
          portfolioId === undefined
            ? ""
            : !input || inputAsNr === 0
              ? " "
              : insufficientFunds && isTradeInUnits
                ? t("tradingModal.insufficientUnitsError")
                : insufficientFunds && !isTradeInUnits
                  ? t("tradingModal.insufficientMarketValueError")
                  : ""
        }
        step="any"
      />

      <TradeTypeToggleButtons
        canToggleTradeType={canToggleTradeType}
        setIsTradeInUnits={setIsTradeInUnits}
        isTradeInUnits={isTradeInUnits}
      />

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
                    roundDown(units, securityAmountDecimalCount).toString()
                  );
                }
                if (!isTradeInUnits && marketValue !== undefined) {
                  return setInput(() =>
                    roundDown(
                      marketValue,
                      portfolioCurrencyAmountDecimalCount
                    ).toString()
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
                    roundDown(units / 2, securityAmountDecimalCount).toString()
                  );
                }
                if (!isTradeInUnits && marketValue !== undefined) {
                  return setInput(() =>
                    roundDown(
                      marketValue / 2,
                      portfolioCurrencyAmountDecimalCount
                    ).toString()
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
      <div className="h-20">
        <div className="flex flex-col gap-4 items-stretch ">
          <div>
            <LabeledDivFlex
              alignText="center"
              tooltipContent={tradeAmountTooltip || blockSizeTradeAmountError}
              id="sellOrderModal-tradeAmountInPfCurrency"
              label={t("tradingModal.approximateTradeAmount")}
              className="text-2xl font-semibold"
            >
              {estimatedTradeAmountInPfCurrency !== undefined &&
              portfolioCurrency !== undefined
                ? t("numberWithCurrency", {
                    value: estimatedTradeAmountInPfCurrency,
                    currency: portfolioCurrency,
                  })
                : "-"}
            </LabeledDivFlex>
            {securityCurrency &&
              portfolioCurrency &&
              portfolioCurrency !== securityCurrency && (
                <LabeledDivFlex
                  alignText="center"
                  id="sellOrderModal-tradeAmountInSecurityCurrency"
                  label={""}
                  className="text-md"
                >
                  (
                  {estimatedTradeAmountInSecurityCurrency !== undefined &&
                  securityCurrency !== undefined
                    ? t("numberWithCurrency", {
                        value: estimatedTradeAmountInSecurityCurrency,
                        currency: securityCurrency,
                      })
                    : "-"}
                  )
                </LabeledDivFlex>
              )}
          </div>
        </div>
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
  );
};
