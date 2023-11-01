import { MutableRefObject, useState, useEffect } from "react";
import { ExecutionMethod } from "api/enums";
import { SecurityTypeCode, SecurityTradeType } from "api/holdings/types";
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
} from "components/index";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { handleNumberInputEvent, handleNumberPasteEvent } from "utils/input";
import { round } from "utils/number";
import { addProtocolToUrl } from "utils/url";
import { useTradablePortfolioSelect } from "../useTradablePortfolioSelect";

export interface BuyModalInitialData {
  id: number;
}

interface BuyModalProps extends BuyModalInitialData {
  modalInitialFocusRef: MutableRefObject<null>;
  onClose: () => void;
}

const isSecurityTypeFund = (securityType: SecurityTypeCode | undefined) =>
  securityType === SecurityTypeCode.COLLECTIVE_INVESTMENT_VEHICLE;

const getTradeType = (securityType: SecurityTypeCode | undefined) =>
  isSecurityTypeFund(securityType) ? "subscription" : "buy";

const getTradeAmount = (
  amount: number,
  isTradeInUnits: boolean | undefined,
  price = 1,
  fxRate = 1,
  BLOCK_SIZE = FALLBACK_DECIMAL_COUNT
) => {
  const value = round(amount, BLOCK_SIZE);
  return isTradeInUnits ? value * price * fxRate : value;
};

const getTradeAmountArgs = (
  amount: number,
  isTradeInUnits: boolean | undefined,
  BLOCK_SIZE: number
) => {
  const value = round(amount, BLOCK_SIZE);
  return isTradeInUnits ? { units: value } : { tradeAmount: value };
};

const FALLBACK_DECIMAL_COUNT = 2;

export const BuyModalContent = ({
  modalInitialFocusRef,
  onClose,
  id: securityId,
}: BuyModalProps) => {
  const {
    data: security = {
      name: "",
      url2: undefined,
      type: { code: undefined },
      latestMarketData: undefined,
      fxRate: 1,
      securityCode: "",
      currency: { securityCode: "" },
      tagsAsSet: [],
      amountDecimalCount: FALLBACK_DECIMAL_COUNT,
    },
  } = useGetSecurityDetails(securityId.toString());
  const {
    name: securityName,
    url2 = undefined,
    type: { code: securityType } = {},
    latestMarketData,
    fxRate,
    tagsAsSet: securityTags,
    amountDecimalCount: securityAmountDecimalCount,
  } = security;

  const [isTradeInUnits, setIsTradeInUnits] = useState(true);
  const [canToggleTradeType, setCanToggleTradeType] = useState(false);
  //in case it takes some time to loop through tags and deduct trade type
  const [hasDeductedTradeType, setHasDeductedTradeType] = useState(false);
  useEffect(() => {
    setHasDeductedTradeType(false);
    const isTradeTypeSpecified = securityTags?.some(
      (tag) =>
        tag === SecurityTradeType.buyUnits ||
        tag === SecurityTradeType.buyTradeAmount
    );
    const isUnitsSupported = securityTags?.some(
      (tag) => tag === SecurityTradeType.buyUnits
    );
    const isTradeAmountSupported = securityTags?.some(
      (tag) => tag === SecurityTradeType.buyTradeAmount
    );
    const isUnitsDefaultTradeType = !isSecurityTypeFund(securityType);
    setCanToggleTradeType(
      isTradeTypeSpecified && isUnitsSupported && isTradeAmountSupported
    );
    setIsTradeInUnits(
      isTradeTypeSpecified
        ? isUnitsSupported &&
            (!isTradeAmountSupported || isUnitsDefaultTradeType)
        : isUnitsDefaultTradeType
    );
    setHasDeductedTradeType(true);
  }, [securityTags, securityType]);

  const { t } = useModifiedTranslation();
  const { selectedContactId } = useGetContractIdData();
  const { data: { portfolios } = { portfolios: [] } } = useGetContactInfo(
    false,
    selectedContactId
  );
  const { setPortfolioId, portfolioOptions, portfolioId } =
    useTradablePortfolioSelect();

  const selectedPortfolioId = portfolioId;

  const { loading, data: portfolioData } = useGetBuyData(selectedPortfolioId);

  const [input, setInput] = useState<string>("0");
  const inputAsNr = input ? Number(input) : 0;

  const portfolioCurrencyAmountDecimalCount =
    portfolioData?.currency.amountDecimalCount || FALLBACK_DECIMAL_COUNT;
  const BLOCK_SIZE = isTradeInUnits
    ? securityAmountDecimalCount
    : portfolioCurrencyAmountDecimalCount;

  const { handleTrade: handleBuy, submitting } = useTrade({
    tradeType: getTradeType(securityType),
    portfolio:
      portfolios.find((portfolio) => portfolio.id === portfolioId) ||
      portfolios[0],
    securityName,
    ...getTradeAmountArgs(inputAsNr, isTradeInUnits, BLOCK_SIZE),
    ...security,
    currency: security.currency.securityCode,
    executionMethod: isTradeInUnits
      ? ExecutionMethod.UNITS
      : ExecutionMethod.NET_TRADE_AMOUNT,
  });

  const availableCash =
    portfolioData?.portfolioReport.accountBalanceAdjustedWithOpenTradeOrders !==
    undefined
      ? portfolioData?.portfolioReport.accountBalanceAdjustedWithOpenTradeOrders
      : undefined;
  const portfolioCurrency = portfolioData?.currency.securityCode;

  const isTradeAmountCorrect =
    availableCash !== undefined &&
    !isNaN(availableCash) &&
    inputAsNr >= 0 &&
    inputAsNr <= availableCash;

  const { readonly } = useKeycloak();

  useEffect(() => {
    //when switching between amount and trade amount
    //we must make sure the input is rounded to the allowed
    //amount of decimals
    setInput((currInput) =>
      round(parseFloat(currInput), BLOCK_SIZE).toString()
    );
  }, [isTradeInUnits, BLOCK_SIZE]);

  return (
    <div className="grid gap-2 min-w-[min(84vw,_375px)]">
      <LabeledDiv
        label={t("tradingModal.securityName")}
        className="text-2xl font-semibold"
      >
        {securityName}
      </LabeledDiv>
      {url2 && (
        <div className="w-fit">
          <DownloadableDocument
            url={addProtocolToUrl(url2)}
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
        {portfolioCurrency &&
          t("numberWithCurrency", {
            value: availableCash,
            currency: portfolioCurrency,
          })}
      </LabeledDiv>
      <Input
        disabled={!hasDeductedTradeType || !portfolioId}
        ref={modalInitialFocusRef}
        value={input}
        onChange={(event) => {
          handleNumberInputEvent(event, setInput, 0, undefined, BLOCK_SIZE);
        }}
        onPaste={(event) => {
          handleNumberPasteEvent(event, setInput, 0, undefined, BLOCK_SIZE);
        }}
        label={
          isTradeInUnits
            ? t("tradingModal.unitsInputLabel")
            : t("tradingModal.tradeAmountInputLabel", {
                currency: portfolioCurrency,
              })
        }
        type="number"
        error={
          !isTradeAmountCorrect && !loading
            ? t("tradingModal.tradeAmountInputError")
            : undefined
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
        <div className="text-3xl font-semibold text-center">
          <div className="text-base font-normal">
            {t("tradingModal.tradeAmount")}
          </div>
          {t("numberWithCurrency", {
            value: isTradeAmountCorrect
              ? getTradeAmount(
                  inputAsNr,
                  isTradeInUnits,
                  latestMarketData?.price,
                  fxRate
                )
              : 0,
            currency: portfolioCurrency,
          })}
        </div>
        <Button
          disabled={
            readonly ||
            inputAsNr === 0 ||
            loading ||
            !isTradeAmountCorrect ||
            !portfolioId
          }
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
