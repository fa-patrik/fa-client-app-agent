import { MutableRefObject, useState, useEffect } from "react";
import { SecurityTypeCode, SecurityTradeType } from "api/holdings/types";
import { useGetPortfolioHoldingDetails } from "api/holdings/useGetPortfolioHoldingDetails";
import { useGetContactInfo } from "api/initial/useGetContactInfo";
import { ExecutionMethod, useTrade } from "api/trading/useTrade";
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
import { round } from "utils/number";
import { useGetSecurityDetails } from "../../../api/holdings/useGetSecurityDetails";
import { useTradablePortfolioSelect } from "../useTradablePortfolioSelect";
import { useTradeAmountInput } from "./useTradeAmountInput";

export interface SellModalInitialData {
  id: number;
}

interface SellModalProps extends SellModalInitialData {
  modalInitialFocusRef: MutableRefObject<null>;
  onClose: () => void;
}

const isSecurityTypeFund = (securityType: SecurityTypeCode | undefined) =>
  securityType === SecurityTypeCode.COLLECTIVE_INVESTMENT_VEHICLE;

const getTradeType = (securityType: SecurityTypeCode | undefined) =>
  isSecurityTypeFund(securityType) ? "redemption" : "sell";

const getCurrentAmount = (
  isTradeInUnits: boolean | undefined,
  amount: number,
  marketValue: number,
  marketFxRate: number
) => (isTradeInUnits ? amount : round(marketValue * marketFxRate, 2));

const getTradeAmount = (
  isTradeInUnits: boolean | undefined,
  tradeAmount: number,
  price: number
) => (isTradeInUnits ? tradeAmount * price : tradeAmount);

const getTradeAmountArgs = (
  amount: number,
  isTradeInUnits: boolean | undefined
) => (isTradeInUnits ? { units: amount } : { tradeAmount: amount });

export const SellModalContent = ({
  modalInitialFocusRef,
  onClose,
  id: securityId,
}: SellModalProps) => {
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
    },
  } = useGetSecurityDetails(securityId.toString());
  const {
    name: securityName,
    currency: { securityCode: currency },
    url2,
    type: { code: securityType } = {},
    latestMarketData,
    tagsAsSet: securityTags,
  } = security;

  const price = ((data) => (data ? data.price : 0))(latestMarketData);

  const [isTradeInUnits, setIsTradeInUnits] = useState(true);
  const [canToggleTradeType, setCanToggleTradeType] = useState(false);
  //in case it takes some time to loop through tags and deduct trade type
  const [hasDeductedTradeType, setHasDeductedTradeType] = useState(false);
  useEffect(() => {
    setHasDeductedTradeType(false);
    const isTradeTypeSpecified = securityTags?.some(
      (tag) =>
        tag === SecurityTradeType.sellUnits ||
        tag === SecurityTradeType.sellTradeAmount
    );
    const isUnitsSupported = securityTags?.some(
      (tag) => tag === SecurityTradeType.sellUnits
    );
    const isTradeAmountSupported = securityTags?.some(
      (tag) => tag === SecurityTradeType.sellTradeAmount
    );
    const isUnitsDefaultTradeType = true; //always true when selling
    setCanToggleTradeType(
      isTradeTypeSpecified && isUnitsSupported && isTradeAmountSupported
    );
    setIsTradeInUnits(
      isTradeTypeSpecified ? isUnitsSupported : isUnitsDefaultTradeType
    );
    setHasDeductedTradeType(true);
  }, [securityTags, securityType]);

  const { t } = useModifiedTranslation();
  const { selectedContactId } = useGetContractIdData();
  const { data: { portfolios } = { portfolios: [] } } = useGetContactInfo(
    false,
    selectedContactId
  );
  const { portfolioId, setPortfolioId, portfolioOptions } =
    useTradablePortfolioSelect();

  const {
    loading,
    data: { marketValue = 0, marketFxRate = 1, amount: units = 0 } = {},
  } = useGetPortfolioHoldingDetails(
    portfolioId?.toString(),
    securityId.toString()
  );
  const currentAmount = getCurrentAmount(
    isTradeInUnits,
    units,
    marketValue,
    marketFxRate
  );

  const {
    inputValue,
    setInputState,
    inputModesOptions,
    inputMode,
    isTradeAmountCorrect,
    amount,
    setTradeAmountToAll,
    setTradeAmountToHalf,
    onInputModeChange,
  } = useTradeAmountInput(currentAmount, currency, isTradeInUnits);

  const { handleTrade: handleSell, submitting } = useTrade({
    tradeType: getTradeType(securityType),
    portfolio:
      portfolios.find((portfolio) => portfolio.id === portfolioId) ||
      portfolios[0],
    securityName,
    ...getTradeAmountArgs(amount, isTradeInUnits),
    ...security,
    currency,
    executionMethod: isTradeInUnits
      ? ExecutionMethod.UNITS
      : ExecutionMethod.NET_TRADE_AMOUNT,
  });

  const { readonly } = useKeycloak();

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
          <DownloadableDocument url={url2} label={t("tradingModal.kiid")} />
        </div>
      )}
      <PortfolioSelect
        portfolioOptions={portfolioOptions}
        portfolioId={portfolioId}
        onChange={(newPortfolio) => setPortfolioId(newPortfolio.id)}
        label={t("tradingModal.portfolio")}
      />
      {isTradeInUnits ? (
        <LabeledDiv
          label={t("tradingModal.currentUnits")}
          className="text-xl font-semibold text-gray-700"
        >
          {currency &&
            t("number", {
              value: currentAmount,
            })}
        </LabeledDiv>
      ) : (
        <LabeledDiv
          label={t("tradingModal.currentMarketValue")}
          className="text-xl font-semibold text-gray-700"
        >
          {currency &&
            t("numberWithCurrency", {
              value: currentAmount,
              currency: currency,
            })}
        </LabeledDiv>
      )}
      <Input
        disabled={!hasDeductedTradeType || !portfolioId}
        ref={modalInitialFocusRef}
        value={inputValue || ""}
        onChange={(event) => {
          setInputState((previousState) => {
            const target = event.target as HTMLInputElement;
            return {
              ...previousState,
              inputValue: Number(target?.value || 0),
            };
          });
        }}
        label={
          isTradeInUnits
            ? t("tradingModal.unitsInputLabel")
            : t("tradingModal.tradeAmountInputLabel", {
                currency: inputMode.label,
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

      <div className="flex justify-between items-center h-8">
        <div className="flex gap-1 items-center">
          <Button size="xs" variant="Secondary" onClick={setTradeAmountToAll}>
            {t("tradingModal.sellAll")}
          </Button>
          {!isTradeInUnits && (
            <Button
              size="xs"
              variant="Secondary"
              onClick={setTradeAmountToHalf}
            >
              {t("tradingModal.sellHalf")}
            </Button>
          )}
        </div>
        {!isTradeInUnits && (
          <div className="flex flex-row gap-2 p-1 text-sm bg-gray-50 rounded-lg border border-gray-300 select-none">
            {inputModesOptions.map((option) => (
              <label
                htmlFor={option.id}
                key={option.id}
                className={`cursor-pointer flex flex-row gap-x-1 justify-center items-center px-3 rounded-lg ${
                  inputMode.id === option.id
                    ? "ring-2 ring-primary-600 bg-primary-50"
                    : ""
                }`}
              >
                <span className="text-sm cursor-pointer">{option.label}</span>
                <input
                  type={"radio"}
                  className="absolute opacity-0 cursor-pointer"
                  id={option.id}
                  name={option.label}
                  checked={inputMode.id === option.id}
                  onChange={() =>
                    onInputModeChange({ id: option.id, label: option.label })
                  }
                />
              </label>
            ))}
          </div>
        )}
      </div>

      <hr />
      <div className="flex flex-col gap-4 items-stretch ">
        <div className="text-3xl font-semibold text-center">
          <div className="text-base font-normal">
            {t("tradingModal.tradeAmount")}
          </div>
          {t("numberWithCurrency", {
            value: isTradeAmountCorrect
              ? getTradeAmount(isTradeInUnits, amount, price)
              : 0,
            currency,
          })}
        </div>
        <Button
          disabled={
            readonly ||
            amount === 0 ||
            loading ||
            !isTradeAmountCorrect ||
            !portfolioId
          }
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
