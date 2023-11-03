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
import { roundDown } from "utils/number";
import { getBlockSizeErrorTooltip, getTradeAmountTooltip } from "utils/trading";
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

const getInsufficientFunds = (
  isTradeInUnits: boolean,
  units: number | undefined,
  unitsToSell: number | undefined,
  marketValue: number | undefined,
  tradeAmountInPfCurrency: number | undefined
) => {
  const insufficientFunds =
    isTradeInUnits && unitsToSell !== undefined && units !== undefined
      ? unitsToSell > units
      : !isTradeInUnits &&
        tradeAmountInPfCurrency !== undefined &&
        marketValue !== undefined
      ? tradeAmountInPfCurrency > marketValue
      : true;

  return insufficientFunds;
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
    selectedPortfolio?.currency.amountDecimalCount || FALLBACK_DECIMAL_COUNT;
  const SECURITY_BLOCK_SIZE =
    security?.amountDecimalCount || FALLBACK_DECIMAL_COUNT;
  const PERCENTAGE_BLOCK_SIZE = FALLBACK_DECIMAL_COUNT;

  const securityFxRate = security?.fxRate || 1;
  const securityPrice = security?.latestMarketData?.price;
  const securityPriceInPfCurrency =
    securityPrice !== undefined ? securityPrice * securityFxRate : undefined;

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

  const tradeAmountInPfCurrency =
    unitsToSell !== undefined && securityPriceInPfCurrency !== undefined
      ? unitsToSell * securityPriceInPfCurrency
      : undefined;
  const tradeAmount =
    unitsToSell !== undefined && securityPrice !== undefined
      ? unitsToSell * securityPrice
      : undefined;

  const securityName =
    security !== undefined
      ? getBackendTranslation(
          security?.name,
          security?.namesAsMap,
          i18n.language
        )
      : "-";

  const { handleTrade: handleSell, submitting } = useTrade({
    tradeType: getTradeType(security?.type.code),
    portfolio:
      portfolios.find((portfolio) => portfolio.id === portfolioId) ||
      portfolios[0],
    securityName,
    units: isTradeInUnits ? unitsToSell : undefined,
    tradeAmount: isTradeInUnits ? tradeAmount : undefined,
    securityCode: security?.securityCode || "",
    executionMethod: isTradeInUnits
      ? ExecutionMethod.UNITS
      : ExecutionMethod.NET_TRADE_AMOUNT,
  });

  const insufficientFunds = getInsufficientFunds(
    isTradeInUnits,
    units,
    unitsToSell,
    marketValue,
    tradeAmountInPfCurrency
  );

  const { readonly } = useKeycloak();

  const loading = !loadingPfReport && !loadingSecurity;

  const disableSellButton = () => {
    return (
      readonly ||
      inputAsNr === 0 ||
      loading ||
      !portfolioId ||
      insufficientFunds
    );
  };

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
    securityPriceInPfCurrency !== undefined
      ? (1 / 10 ** SECURITY_BLOCK_SIZE) * securityPriceInPfCurrency
      : undefined;

  const blockSizeTradeAmountError =
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
        ? roundDown(parseFloat(currInput), INPUT_BLOCK_SIZE).toString()
        : "";
    });
  }, [INPUT_BLOCK_SIZE]);

  console.log(tradeAmountInPfCurrency);
  console.log(marketValue);

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
            ? "Share (%) of units"
            : isPercentageMode && !isTradeInUnits
            ? "Share (%) of trade amount"
            : isTradeInUnits
            ? t("tradingModal.unitsInputLabel")
            : t("tradingModal.tradeAmountInputLabel", {
                currency: portfolioCurrency,
              })
        }
        type="text"
        error={insufficientFunds ? "SHIIT" : ""}
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

      <div className="flex justify-between items-center h-8">
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
                    roundDown(marketValue, SECURITY_BLOCK_SIZE).toString()
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
                    roundDown(marketValue / 2, SECURITY_BLOCK_SIZE).toString()
                  );
                }
              }
            }}
          >
            {t("tradingModal.sellHalf")}
          </Button>
        </div>
        <div className="flex z-0 justify-center items-center p-1 text-sm bg-gray-50 rounded-lg border border-gray-300 select-none">
          <Toggle
            enabled={isPercentageMode}
            setEnabled={setIsPercentageMode}
            label="%"
          />
        </div>
      </div>

      <hr />
      <div className="flex flex-col gap-4 items-stretch ">
        <div className="text-3xl font-semibold text-center">
          <LabeledDivFlex
            alignText="center"
            tooltipContent={tradeAmountTooltip || blockSizeTradeAmountError}
            id="sellOrderModal-tradeAmount"
            label={t("tradingModal.tradeAmount")}
            className="text-2xl font-semibold"
          >
            {t("numberWithCurrency", {
              value: tradeAmountInPfCurrency || 0,
              currency: portfolioCurrency,
            })}
          </LabeledDivFlex>
        </div>
        <Button
          disabled={disableSellButton()}
          isLoading={submitting}
          onClick={async () => {
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
