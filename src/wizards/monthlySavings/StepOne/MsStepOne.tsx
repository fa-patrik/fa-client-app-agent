import { useEffect, useMemo, useState } from "react";
import { ReactComponent as ExclamationIcon } from "assets/exclamation-circle.svg";
import { Card, Input, LoadingIndicator, PortfolioSelect } from "components";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { useFilteredPortfolioSelect } from "components/TradingModals/useFilteredPortfolioSelect";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useWizard } from "providers/WizardProvider";
import { canPortfolioOptionMonthlySave } from "services/permissions/usePermission";
import OnError from "../components/OnError";
import {
  PortfolioProfileAndFiguresAndAccounts,
  getUniqueExternalAccounts,
  useGetPortfoliosProfileAndFiguresAndAccounts,
} from "../StepZero/api/useGetPortfoliosWithProfileAndAccounts";

//min units of money to invest
const PF_KEYFIGURE_CODE_MIN_AMOUNT = "CP_MS_MINAMOUNT";

/**
 * Step one of the monthly savings process.
 * The user selects the portfolio and amount to save.
 */
const MsStepOne = () => {
  const { wizardData, setWizardData } = useWizard();
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
  const [selectedPortfolioOption, setSelectedPortfolioOption] =
    useState<PortfolioOption>(
      wizardData?.data?.selectedPortfolioOption ||
        portfolioOptions.find((o) => o.id === portfolioId) ||
        portfolioOptions[0]
    );

  const [portfolio, setPortfolio] = useState<
    PortfolioProfileAndFiguresAndAccounts | undefined
  >(() =>
    portfolioData?.portfolios?.find((p) => p.id === selectedPortfolioOption.id)
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

  const [inputValue, setInputValue] = useState(() => {
    if (minAmount && wizardData?.data?.amountToSave < minAmount) {
      return minAmount;
    }
    return wizardData?.data?.amountToSave || 100;
  });
  const [inputError, setInputError] = useState("");

  useEffect(() => {
    const selectedPortfolio = portfolioData?.portfolios?.find(
      (p) => p.id === selectedPortfolioOption.id
    );
    setPortfolio(() => selectedPortfolio);
  }, [portfolioData?.portfolios, selectedPortfolioOption]);

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
  }, [selectedPortfolioOption, setWizardData, externalAcc]);

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

  useEffect(() => {
    setWizardData((prevState) => ({
      ...prevState,
      data: {
        ...prevState.data,
        selectedPortfolio: portfolio,
      },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolio]);

  /** Ensures input is a positive integer */
  const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
    const target = event.currentTarget;
    if (target instanceof HTMLInputElement) {
      const newValue = target.value.replace(/[^0-9]/g, ""); // remove non-digits
      setInputValue(newValue);
    }
  };

  /** Ensures pasted input is a positive integer */
  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const text = event.clipboardData.getData("text");
    const value = text.replace(/[^0-9]/g, ""); // remove non-digits
    setInputValue(value);
  };

  const NoAccountWarning = () => {
    return (
      <div className="flex items-center p-1 w-full text-sm rounded-lg border bg-amber-50">
        <div>
          <ExclamationIcon className=" mr-2 stroke-amber-600" />
        </div>
        <span className="text-xs text-amber-600" id="noAccountWarningMessage">
          {t("wizards.monthlySavings.stepOne.noAccountWarningMessage")}
        </span>
      </div>
    );
  };

  const AccountBadge = ({ accountNr }: { accountNr: string }) => {
    return (
      <div className="p-2 w-full text-sm text-gray-900">
        <span id="debitAccount">{accountNr}</span>
      </div>
    );
  };

  const errorGettingData = errorGettingPortfolioData;
  if (errorGettingData)
    return (
      <OnError
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
          <PortfolioSelect
            id="portfolioSelect"
            label={t("wizards.monthlySavings.stepOne.portfolioInputLabel")}
            onChange={setSelectedPortfolioOption}
            portfolioId={selectedPortfolioOption.id}
            portfolioOptions={portfolioOptions}
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
            id="amountInput"
            error={inputError}
            type="number"
            value={inputValue}
            onChange={(e) => handleInput(e)}
            onPaste={(e) => handlePaste(e)}
            className="text-black rounded-lg"
            label={t("wizards.monthlySavings.stepOne.amountInputLabel", {
              currency: portfolioCurrencyCode,
            })}
            placeholder={`${minAmount || 100}`}
          />
          {minAmount && (
            <p className="text-xs font-thin" id="minAmountDisclaimer">
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
