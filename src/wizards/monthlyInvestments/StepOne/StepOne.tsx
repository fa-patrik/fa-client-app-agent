import { useEffect, useMemo, useState } from "react";
import {
  PortfolioWithProfileAndFigures,
  useGetPortfoliosWithProfileAndFigures,
} from "api/generic/useGetPortfoliosWithProfileAndFigures";
import {
  Button,
  Card,
  ComboBox,
  ErrorMessage,
  Input,
  LoadingIndicator,
} from "components";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { useFilteredPortfolioSelect } from "components/TradingModals/useFilteredPortfolioSelect";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useWizard } from "providers/WizardProvider";
import { canPortfolioOptionMonthlyInvest } from "services/permissions/usePermission";
import { addMonthlyInvestmentsToPortfolios } from "utils/faBackProfiles/monthlyInvestments";
import { MonthlyInvestmentsWizardState } from "../types";

//min units of money to invest
const PF_KEYFIGURE_CODE_MIN_AMOUNT = "CP_MI_MINAMOUNT";

/**
 * Step one of the monthly investments process.
 * The user selects the securities to invest into.
 */
const StepOne = () => {
  const { wizardData, setWizardData } =
    useWizard<MonthlyInvestmentsWizardState>();
  const monthlyInvestmentsWizardState = wizardData.data;
  const { t } = useModifiedTranslation();
  const {
    data: portfolioData,
    error: errorGettingPortfolioData,
    refetch,
    networkStatus,
  } = useGetPortfoliosWithProfileAndFigures();
  const { portfolioOptions, portfolioId } = useFilteredPortfolioSelect(
    canPortfolioOptionMonthlyInvest
  );

  const portfoliosWithValidMonthlyInvestments = useMemo(() => {
    return portfolioData?.portfolios
      ? addMonthlyInvestmentsToPortfolios(portfolioData?.portfolios)
      : [];
  }, [portfolioData?.portfolios]);

  const filteredPortfolioOptions = useMemo(() => {
    if (wizardData.data.isEditing) return portfolioOptions;
    return portfolioOptions?.filter(
      //all pf without a valid monthly investments plan
      (o) => portfoliosWithValidMonthlyInvestments.every((p) => p.id !== o.id)
    );
  }, [
    portfolioOptions,
    portfoliosWithValidMonthlyInvestments,
    wizardData.data.isEditing,
  ]);

  const [selectedPortfolioOption, setSelectedPortfolioOption] =
    useState<PortfolioOption>(
      monthlyInvestmentsWizardState.selectedPortfolioOption ||
        filteredPortfolioOptions.find((o) => o.id === portfolioId) ||
        filteredPortfolioOptions[0]
    );

  const [portfolio, setPortfolio] = useState<
    PortfolioWithProfileAndFigures | undefined
  >(() =>
    portfolioData?.portfolios?.find((p) => p.id === selectedPortfolioOption.id)
  );

  const minAmount = portfolio?.figuresAsObject?.latestValues[
    PF_KEYFIGURE_CODE_MIN_AMOUNT
  ]?.value as number;

  const portfolioCurrencyCode = portfolio?.currency.securityCode;

  const [inputValue, setInputValue] = useState<string>(() => {
    if (
      minAmount &&
      monthlyInvestmentsWizardState.amountToInvest &&
      monthlyInvestmentsWizardState.amountToInvest < minAmount
    ) {
      return minAmount.toString();
    }
    return monthlyInvestmentsWizardState.amountToInvest?.toString() || "100";
  });
  const [inputError, setInputError] = useState("");

  useEffect(() => {
    const selectedPortfolio = portfolioData?.portfolios?.find(
      (p) => p.id === selectedPortfolioOption.id
    );
    setPortfolio(() => selectedPortfolio);
  }, [portfolioData?.portfolios, selectedPortfolioOption]);

  //set portfolio to wizard state
  useEffect(() => {
    setWizardData((prevState) => ({
      ...prevState,
      data: {
        ...prevState.data,
        selectedPortfolioOption: selectedPortfolioOption,
      },
    }));
  }, [selectedPortfolioOption, setWizardData]);

  //validate written input and set it to the wizard state
  useEffect(() => {
    const inputAsNumber = Number(inputValue);
    if (!inputAsNumber) {
      setInputError(" ");
      setWizardData((prevState) => ({ ...prevState, nextDisabled: true }));
      return;
    }

    if (minAmount && inputAsNumber < minAmount) {
      setInputError(t("wizards.monthlyInvestments.stepOne.amountInputError"));
      setWizardData((prevState) => ({ ...prevState, nextDisabled: true }));
      return;
    }

    setWizardData((prevState) => ({
      ...prevState,
      //enable next on correct input
      nextDisabled: false,
      data: {
        ...prevState.data,
        amountToInvest: inputAsNumber,
      },
    }));
    setInputError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, minAmount]);

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

  if (errorGettingPortfolioData)
    return (
      <div className="p-4 m-auto w-full h-full">
        <ErrorMessage header={t("messages.noCachedDataInfo")}>
          {networkStatus === 4 ? (
            <LoadingIndicator center size="sm" />
          ) : (
            <Button
              onClick={async () => {
                await refetch();
              }}
              variant="Transparent"
            >
              <span className="text-primary-500 underline">
                {t("wizards.monthlyInvestments.stepOne.refetchDataButtonLabel")}
              </span>
            </Button>
          )}
        </ErrorMessage>
      </div>
    );

  return (
    <div className="p-4 m-auto w-full max-w-sm">
      <div>
        <Card>
          <div className="flex flex-col gap-y-3 p-6">
            <ComboBox
              disabled={monthlyInvestmentsWizardState.isEditing ?? false}
              label={t(
                "wizards.monthlyInvestments.stepOne.portfolioInputLabel"
              )}
              onChange={setSelectedPortfolioOption}
              options={filteredPortfolioOptions}
              value={selectedPortfolioOption}
            />
            <Input
              error={inputError}
              type="number"
              value={inputValue}
              onChange={(e) => handleInput(e)}
              onPaste={(e) => handlePaste(e)}
              className="text-black rounded-lg"
              label={t("wizards.monthlyInvestments.stepOne.amountInputLabel", {
                currency: portfolioCurrencyCode,
              })}
              placeholder={`${minAmount || 100}`}
            />
            {minAmount && (
              <p className="text-sm font-thin">
                {t("wizards.monthlyInvestments.stepOne.minAmountDisclaimer", {
                  amount: minAmount,
                  currency: portfolioCurrencyCode,
                })}
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StepOne;
