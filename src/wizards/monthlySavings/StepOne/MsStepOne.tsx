import { useCallback, useEffect, useMemo, useState } from "react";
import { ReactComponent as ExclamationIcon } from "assets/exclamation-circle.svg";
import { Card, ComboBox, Input, LoadingIndicator } from "components";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { useFilteredPortfolioSelect } from "components/TradingModals/useFilteredPortfolioSelect";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useWizard } from "providers/WizardProvider";
import { canPortfolioOptionMonthlySave } from "services/permissions/trading";
import { addMonthlySavingsToPortfolios } from "utils/faBackProfiles/monthlySavings";
import { handleNumberInputEvent, handleNumberPasteEvent } from "utils/input";
import OnError from "../components/OnError";
import {
  getUniqueExternalAccounts,
  useGetPortfoliosProfileAndFiguresAndAccounts,
} from "../StepZero/api/useGetPortfoliosWithProfileAndAccounts";
import { MonthlySavingsWizardState } from "../types";

//min units of money to invest
const PF_KEYFIGURE_CODE_MIN_AMOUNT = "CP_MS_MINAMOUNT";

const AccountBadge = ({ accountNr }: { accountNr: string }) => {
  return (
    <div className="p-2 w-full text-sm text-gray-900">
      <span id="monthlySavingsWizard-debitAccountNumber">{accountNr}</span>
    </div>
  );
};

/**
 * Step one of the monthly savings process.
 * The user selects the portfolio and amount to save.
 */
const MsStepOne = () => {
  const { wizardData, setWizardData } = useWizard<MonthlySavingsWizardState>();
  const { t, i18n } = useModifiedTranslation();
  const {
    loading: loadingPortfolioData,
    data: portfolioData,
    error: errorGettingPortfolioData,
    refetch: refetchPortfolioData,
    networkStatus,
  } = useGetPortfoliosProfileAndFiguresAndAccounts();
  const { portfolioOptions, portfolioId } = useFilteredPortfolioSelect(
    canPortfolioOptionMonthlySave
  );

  const portfoliosWithMonthlySavings = useMemo(() => {
    return portfolioData?.portfolios
      ? addMonthlySavingsToPortfolios(portfolioData?.portfolios)
      : [];
  }, [portfolioData?.portfolios]);

  const filteredPortfolioOptions = useMemo(() => {
    if (wizardData.data.isEditing) return portfolioOptions;
    return portfolioOptions?.filter(
      //all pf without a valid monthly savings plan
      (o) => portfoliosWithMonthlySavings?.every((p) => p.id !== o.id)
    );
  }, [
    portfoliosWithMonthlySavings,
    portfolioOptions,
    wizardData.data.isEditing,
  ]);

  const [selectedPortfolioOption, setSelectedPortfolioOption] =
    useState<PortfolioOption>(
      wizardData?.data?.selectedPortfolioOption ||
        filteredPortfolioOptions.find((o) => o.id === portfolioId) ||
        filteredPortfolioOptions[0]
    );

  const portfolio = portfolioData?.portfolios?.find(
    (p) => p.id === selectedPortfolioOption?.id
  );

  const externalAcc = useMemo(() => {
    const extnernalAccounts = getUniqueExternalAccounts(
      portfolio?.portfolioReport.accountItems || [],
      portfolio?.accounts || []
    );
    return extnernalAccounts?.[0];
  }, [portfolio]);

  const minAmount = portfolio?.figuresAsObject?.latestValues[
    PF_KEYFIGURE_CODE_MIN_AMOUNT
  ]?.value as number;

  const portfolioCurrencyCode = portfolio?.currency.securityCode;

  const [inputValue, setInputValue] = useState<string>(() => {
    if (
      minAmount !== undefined &&
      wizardData?.data?.amountToSave !== undefined &&
      wizardData.data.amountToSave < minAmount
    ) {
      return minAmount.toString();
    }
    return wizardData?.data?.amountToSave?.toString() || "100";
  });
  const [inputError, setInputError] = useState("");

  //set portfolio and account to wizard state
  useEffect(() => {
    setWizardData((prevState) => ({
      ...prevState,
      data: {
        ...prevState.data,
        selectedPortfolioOption: selectedPortfolioOption,
        selectedAccount: externalAcc,
      },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPortfolioOption, externalAcc]);

  //validate written input and set it to the wizard state
  useEffect(() => {
    const inputAsNumber = Number(inputValue);
    const inputProvided = !!inputAsNumber;
    const inputBelowMinAmount =
      inputProvided && minAmount && inputAsNumber < minAmount;
    const noEligibleAccount = !externalAcc;

    if (!inputProvided) {
      setInputError(" ");
    } else if (inputBelowMinAmount) {
      setInputError(t("wizards.monthlySavings.stepOne.amountInputError"));
    } else {
      setInputError("");
    }

    setWizardData((prevState) => ({
      ...prevState,
      //enable next
      nextDisabled: !inputProvided || inputBelowMinAmount || noEligibleAccount,
      data: {
        ...prevState.data,
        amountToSave: inputAsNumber,
      },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, minAmount, externalAcc]);

  const CURRENCY_BLOCK_SIZE = portfolio?.currency.amountDecimalCount || 2;

  const NoAccountWarning = useCallback(() => {
    return (
      <div className="flex items-center p-1 w-full text-sm rounded-lg border bg-amber-50">
        <div>
          <ExclamationIcon className=" mr-2 stroke-amber-600" />
        </div>
        <span
          className="text-xs text-amber-600"
          id="monthlySavingsWizard-noAccountWarningMessage"
        >
          {t("wizards.monthlySavings.stepOne.noAccountWarningMessage")}
        </span>
      </div>
    );
  }, [t]);

  const errorGettingData = errorGettingPortfolioData;
  if (errorGettingData)
    return (
      <OnError
        id="monthlySavingsWizard-error"
        refetchData={async () => {
          await refetchPortfolioData();
        }}
        networkStatus={networkStatus}
      />
    );

  return (
    <div className="p-2 m-auto w-full max-w-xs">
      <Card>
        <div className="flex flex-col gap-y-3 p-6">
          <ComboBox
            id="monthlySavingsWizard-portfolioSelector"
            label={t("wizards.monthlySavings.stepOne.portfolioInputLabel")}
            onChange={setSelectedPortfolioOption}
            options={filteredPortfolioOptions}
            value={selectedPortfolioOption}
            disabled={wizardData.data.isEditing ?? false}
          />
          <div>
            {loadingPortfolioData ? (
              <LoadingIndicator size="xs" />
            ) : externalAcc ? (
              <div className="cursor-not-allowed">
                <p className="text-sm">
                  {t("wizards.monthlySavings.stepOne.linkedAccountLabel")}
                </p>
                <AccountBadge accountNr={externalAcc?.number} />
              </div>
            ) : (
              <NoAccountWarning />
            )}
          </div>

          <hr />
          <Input
            id="monthlySavingsWizard-amountInput"
            error={inputError}
            type="number"
            value={inputValue}
            onChange={(e) =>
              handleNumberInputEvent(
                e,
                setInputValue,
                0,
                undefined,
                CURRENCY_BLOCK_SIZE
              )
            }
            onPaste={(e) =>
              handleNumberPasteEvent(
                e,
                setInputValue,
                0,
                undefined,
                CURRENCY_BLOCK_SIZE
              )
            }
            className="text-black rounded-lg"
            label={t("wizards.monthlySavings.stepOne.amountInputLabel", {
              currency: portfolioCurrencyCode,
            })}
            placeholder={`${minAmount || 100}`}
            step="any"
          />
          {minAmount && (
            <p
              className="text-sm font-thin"
              id="monthlySavingsWizard-minAmountDisclaimer"
            >
              {t("wizards.monthlySavings.stepOne.minAmountDisclaimer") + " "}
              {minAmount.toLocaleString(i18n.language, {
                style: "currency",
                currency: portfolioCurrencyCode,
              })}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MsStepOne;
