import { MutableRefObject, useState, useEffect, useMemo } from "react";
import { Portfolio, useGetContactInfo } from "api/common/useGetContactInfo";
import { AccountCategory, AccountType, ExecutionMethod } from "api/enums";
import { SecurityTypeCode } from "api/holdings/types";
import { useGetSecurityDetails } from "api/holdings/useGetSecurityDetails";
import { useGetBuyData } from "api/trading/useGetBuyData";
import { useGetSecurityFx } from "api/trading/useGetSecurityFx";
import { useTrade } from "api/trading/useTrade";
import {
  PortfolioSelect,
  DownloadableDocument,
  Button,
  Input,
  LabeledDiv,
  ComboBox,
} from "components/index";
import { LabeledDivFlex } from "components/LabeledDiv/LabeledDivFlex";
import { Option } from "components/Select/Select";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { getBackendTranslation } from "utils/backTranslations";
import { getNumberOfOptions } from "utils/faBackProfiles/common";
import { handleNumberInputEvent, handleNumberPasteEvent } from "utils/input";
import { round, roundDown } from "utils/number";
import {
  getBlockSizeErrorTooltip,
  getBlockSizeMinTradeAmount,
  getTradeAmountTooltip,
} from "utils/trading";
import { addProtocolToUrl } from "utils/url";
import PortfolioLock from "../PortfolioLock";
import TradeTypeToggleButtons from "../TradeTypeToggleButtons";
import { useTradablePortfolioSelect } from "../useTradablePortfolioSelect";
import { useGetBuyTradeType } from "./useGetBuyTradeType";

export interface BuyModalInitialData {
  id: number;
  name: string;
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
  name,
}: BuyModalProps) => {
  
  const [submitting, setSubmitting] = useState(false);
  const { t, i18n } = useModifiedTranslation();

  const { data: security, loading: loadingSecurity } = useGetSecurityDetails(
    securityId.toString(),
  );
  const {
    setPortfolioId,
    portfolioOptions: portfolioOptionsThatCanTrade,
    portfolioId,
  } = useTradablePortfolioSelect(security?.groups);
  const { portfolioOptions: portfolioOptionsThatCantTradeTheSecurity } =
    useTradablePortfolioSelect();

  const { selectedContactId } = useGetContractIdData();
  const { data: { portfolios } = { portfolios: [] } } = useGetContactInfo(
    false,
    selectedContactId
  );

  const selectedPortfolioId = portfolioId;
  const selectedPortfolio = useMemo(() => {
    return portfolios.find((p) => p.id === portfolioId);
  }, [portfolios, portfolioId]);


  const { loading: loadingCash, data: portfolioData } = useGetBuyData(
    selectedPortfolioId,
    security?.currency?.securityCode
  );

  //filter out accounts that are not cash accounts
  const selectableAccounts = useMemo(() => {
    return  portfolioData?.accounts?.filter(a => a.category !== AccountCategory.External && a.type === AccountType.Cash ) || []
  }, [portfolioData?.accounts])

  //convert to options compatible with ComboBox
  const accountOptions: Option[] = useMemo(() => {
    return selectableAccounts?.map((a) => ({
      id: a.id,
      label: `${a.name} | ${a.currency.securityCode}`,
    })) ?? [] 
  },[ selectableAccounts])

  const portfolioHasAccounts = !!accountOptions.length;

  //set this by default if it exists
  const defaultAccount =
    portfolioData?.accounts?.find(
      //first with same currency as security
      (a) => a?.currency?.securityCode === security?.currency?.securityCode
    ) ?? selectableAccounts?.[0] //default to first account if no match

  const [selectedAccountId, setSelectedAccountId] = useState<number | undefined>(defaultAccount?.id);
  
  const selectedAccount = selectableAccounts?.find((a) => a.id === selectedAccountId);
  const selectedAccountOption = accountOptions.find((a) => a.id === selectedAccountId);
  const isSelectedAccountInOptions = accountOptions.some((a) => a.id === selectedAccountId);
  //auto populate an account if there is none selected
  useEffect(() => {
    if((!selectedAccountId || !isSelectedAccountInOptions)) {
      setSelectedAccountId(defaultAccount?.id)
    }
  },[defaultAccount, selectedAccountId, isSelectedAccountInOptions])

  const { data: securityToPfFxRateData, loading: securityFxLoading } = useGetSecurityFx(
    security?.securityCode,
    selectedPortfolio?.currency?.securityCode
  );

  

  const securityToPfFxRate =  securityToPfFxRateData?.[0]?.fxRate ?? 1; //SEC/PF
  const securityToAccountFxRate = 1 / (selectedAccount?.currency?.fxRate ?? 1); //inverse of ACC/SEC -> SEC/ACC

  const { isTradeInUnits, canToggleTradeType, setIsTradeInUnits } =
    useGetBuyTradeType(security?.tagsAsSet, security?.type?.code);

  const [input, setInput] = useState<string>("");
  const inputAsNr = input ? Number(input) : 0;

  const securityAmountDecimalCount =
    security?.amountDecimalCount !== undefined
      ? security.amountDecimalCount
      : FALLBACK_DECIMAL_COUNT;
  const securityCurrencyAmountDecimalCount =
    security?.currency.amountDecimalCount !== undefined
      ? security?.currency.amountDecimalCount
      : FALLBACK_DECIMAL_COUNT;
  const portfolioCurrencyAmountDecimalCount =
    portfolioData?.currency.amountDecimalCount !== undefined
      ? portfolioData?.currency.amountDecimalCount
      : FALLBACK_DECIMAL_COUNT;
  const accountCurrencyAmountDecimalCount =
    selectedAccount?.currency.amountDecimalCount !== undefined
      ? selectedAccount?.currency.amountDecimalCount
      : FALLBACK_DECIMAL_COUNT;
  const inputBlockSize = isTradeInUnits
    ? securityAmountDecimalCount
    : accountCurrencyAmountDecimalCount;
    
  const securityNameTranslated =
    security !== undefined
      ? getBackendTranslation(
          security?.name,
          security?.namesAsMap,
          i18n.language,
          i18n.resolvedLanguage
        )
      : undefined;


  const securityPrice = security?.latestMarketData?.price;

  const securityPriceInAccCurrency =
    securityPrice !== undefined
      ? round(
          securityPrice * securityToAccountFxRate,
          accountCurrencyAmountDecimalCount
        )
      : undefined;

  const securityPriceInPfCurrency = securityPrice !== undefined
    ? round(
        securityPrice * securityToPfFxRate,
        portfolioCurrencyAmountDecimalCount
      )
    : undefined;

  const unitsToBuyFromTradeAmount =
    securityPriceInAccCurrency !== undefined
      ? inputAsNr / (securityPriceInAccCurrency || 1)
      : undefined;

  const unitsToBuy = isTradeInUnits
    ? roundDown(inputAsNr, securityAmountDecimalCount)
    : unitsToBuyFromTradeAmount !== undefined
    ? roundDown(unitsToBuyFromTradeAmount, securityAmountDecimalCount)
    : undefined;

  const estimatedTradeAmountInPfCurrency = 
    unitsToBuy !== undefined && securityPriceInPfCurrency !== undefined
      ? round(unitsToBuy * securityPriceInPfCurrency, portfolioCurrencyAmountDecimalCount)
      : undefined;

  const estimatedTradeAmountInAccountCurrency =
    unitsToBuy !== undefined && securityPriceInAccCurrency !== undefined
      ? round(
          unitsToBuy * securityPriceInAccCurrency,
          accountCurrencyAmountDecimalCount
        )
      : undefined;

  const estimatedTradeAmountInSecurityCurrency =
    unitsToBuy !== undefined && securityPrice !== undefined
      ? round(unitsToBuy * securityPrice, securityCurrencyAmountDecimalCount)
      : undefined;

  const calculatedReportFxRate =
    (estimatedTradeAmountInSecurityCurrency || 0) /
    (estimatedTradeAmountInPfCurrency || 1);

  const calculatedAccountFxRate =
    (estimatedTradeAmountInSecurityCurrency || 0) /
    (estimatedTradeAmountInAccountCurrency || 1);

  const { handleTrade: handleBuy } = useTrade({
    tradeType: getTradeType(security?.type.code),
    portfolio: selectedPortfolio ?? ({} as Portfolio),
    securityName: securityNameTranslated ?? name ?? "-",
    units: isTradeInUnits ? unitsToBuy : undefined,
    tradeAmount: !isTradeInUnits
      ? estimatedTradeAmountInSecurityCurrency
      : undefined,
    securityCode: security?.securityCode || "",
    executionMethod: isTradeInUnits
      ? ExecutionMethod.UNITS
      : ExecutionMethod.NET_TRADE_AMOUNT,
    accountFxRate: calculatedAccountFxRate,
    reportFxRate: calculatedReportFxRate,
    account: selectedAccount?.number,
  });

  const selectedAccountItem = portfolioData?.portfolioReport?.accountItems?.find(
    (a) => a.accountId === selectedAccountId
  );

  const availableCashInAccountCurrency = selectedAccountItem?.balanceAccCurr;

  const securityCurrency = security?.currency.securityCode;
  const accountCurrency = selectedAccount?.currency.securityCode;
  
  const insufficientCash =
    (availableCashInAccountCurrency ?? 0) < (estimatedTradeAmountInAccountCurrency ?? 0); // less than trying to buy for

  const { access } = useKeycloak();

  const tradeAmountTooltip =
    unitsToBuy !== undefined &&
    security !== undefined &&
    accountCurrency !== undefined
      ? getTradeAmountTooltip(
          unitsToBuy,
          security,
          securityToAccountFxRate,
          accountCurrency,
          i18n.language,
          i18n.resolvedLanguage,
          t
        )
      : undefined;

  //min trade amount allowed to trade in this security
  //based on its block size only
  const blockSizeMinTradeAmountInAccCurrency =
    securityPrice !== undefined
      ? round(
          getBlockSizeMinTradeAmount(
            securityAmountDecimalCount,
            securityPrice
          ) * securityToAccountFxRate,
          accountCurrencyAmountDecimalCount
        )
      : undefined;

  const blockSizeTradeAmountError =
    !isTradeInUnits &&
    inputAsNr > 0 &&
    security !== undefined &&
    blockSizeMinTradeAmountInAccCurrency !== undefined &&
    accountCurrency !== undefined &&
    estimatedTradeAmountInAccountCurrency !== undefined &&
    blockSizeMinTradeAmountInAccCurrency > estimatedTradeAmountInAccountCurrency //input is lower than min allowed trade amount
      ? getBlockSizeErrorTooltip(
          blockSizeMinTradeAmountInAccCurrency,
          security,
          securityToAccountFxRate,
          accountCurrency,
          i18n.language,
          i18n.resolvedLanguage,
          t,
          true
        )
      : undefined;

  useEffect(() => {
    //when switching between amount and trade amount
    //we must make sure the input is rounded to the allowed
    //amount of decimals
    setInput((currInput) =>
      currInput ? round(parseFloat(currInput), inputBlockSize).toString() : ""
    );
  }, [inputBlockSize]);

  const loading = loadingCash || loadingSecurity || securityFxLoading;

  const disableBuyButton = () => {
    return (
      loading ||
      inputAsNr === 0 ||
      insufficientCash ||
      !!blockSizeTradeAmountError ||
      !access.buy ||
      !selectedPortfolio ||
      submitting ||
      (portfolioHasAccounts && !selectedAccountItem)
    );
  };

  const areSomePortfoliosProhibitedToTradeTheSecurity =
    getNumberOfOptions(portfolioOptionsThatCanTrade) !==
    getNumberOfOptions(portfolioOptionsThatCantTradeTheSecurity);

  

  return (
    <div className="grid gap-2 max-w-md min-w-[min(84vw,_375px)]">
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
              url={addProtocolToUrl(security?.url2)}
              label={t("tradingModal.kiid")}
            />
          </div>
        )}
      </div>

      <PortfolioSelect
        portfolioOptions={portfolioOptionsThatCanTrade}
        portfolioId={portfolioId}
        onChange={(newPortfolio) => setPortfolioId(newPortfolio.id)}
        label={t("tradingModal.portfolio")}
        error={!portfolioId ? t("tradingModal.selectPortfolioError") : ""}
      />


        <ComboBox 
        label={t("tradingModal.account")}
        value={selectedAccountOption}
        onChange={(newAccount) => {
          if(newAccount.id !== undefined) {
            setSelectedAccountId(newAccount?.id as number);
          }
        }}
        options={accountOptions}
        error={!selectedAccountId && !loading ? t("tradingModal.buyModalAccountError") : ""}
      />


      {areSomePortfoliosProhibitedToTradeTheSecurity && <PortfolioLock />}
      <div className="h-14 ">
        <LabeledDiv
          label={t("tradingModal.availableCash")}
          className="text-xl font-semibold text-gray-700"
        >
          {availableCashInAccountCurrency !== undefined && accountCurrency !== undefined
            ? t("numberWithCurrency", {
                value: availableCashInAccountCurrency,
                currency: accountCurrency,
              })
            : "-"}
        </LabeledDiv>
      </div>

      <Input
        disabled={!portfolioId}
        ref={modalInitialFocusRef}
        value={input}
        onChange={(event) => {
          handleNumberInputEvent(event, setInput, 0, undefined, inputBlockSize);
        }}
        onPaste={(event) => {
          handleNumberPasteEvent(event, setInput, 0, undefined, inputBlockSize);
        }}
        label={
          isTradeInUnits
            ? t("tradingModal.unitsInputLabel")
            : t("tradingModal.tradeAmountSimpleInputLabel")
        }
        type="number"
        error={
          portfolioId === undefined
            ? ""
            : !input || inputAsNr === 0
            ? " "
            : insufficientCash && !loading
            ? t("tradingModal.insufficientCashError")
            : ""
        }
        step="any"
      />

      <TradeTypeToggleButtons
        canToggleTradeType={canToggleTradeType}
        setIsTradeInUnits={setIsTradeInUnits}
        isTradeInUnits={isTradeInUnits}
      />

      <hr className="my-1" />
      <div className="h-20 ">
        <div className="flex flex-col gap-4 items-stretch">
          <div>
            <LabeledDivFlex
              alignText="center"
              tooltipContent={tradeAmountTooltip || blockSizeTradeAmountError}
              id="buyOrderModal-tradeAmount"
              label={t("tradingModal.approximateTradeAmount")}
              className="text-2xl font-semibold"
            >
              {accountCurrency !== undefined &&
              estimatedTradeAmountInAccountCurrency !== undefined
                ? `${t("number", {
                    value: estimatedTradeAmountInAccountCurrency,
                  })} ${accountCurrency} `
                : "-"}
            </LabeledDivFlex>
            {securityCurrency &&
              accountCurrency &&
              accountCurrency !== securityCurrency && (
                <LabeledDivFlex
                  alignText="center"
                  id="buyOrderModal-tradeAmount"
                  label={""}
                  className="text-md"
                >
                  (
                  {estimatedTradeAmountInSecurityCurrency !== undefined &&
                  securityCurrency !== undefined
                    ? `${t("number", {
                        value: estimatedTradeAmountInSecurityCurrency,
                      })} ${securityCurrency}`
                    : "-"}
                  )
                </LabeledDivFlex>
              )}
          </div>
        </div>
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

      <hr className="my-1" />

      <div className="text-xs text-center text-gray-600 max-w-[375px]">
        {t("tradingModal.buyDisclaimer")}
      </div>
    </div>
  );
};
