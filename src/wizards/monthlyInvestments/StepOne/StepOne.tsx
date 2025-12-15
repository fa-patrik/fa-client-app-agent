import { useEffect, useMemo, useState } from "react";
import {
  PortfolioGroups,
  RepresentativeTag,
} from "api/common/useGetContactInfo";
import type { PortfolioWithProfileAndFigures } from "api/common/useGetPortfoliosWithProfileAndFigures";
import { useGetPortfoliosWithProfileAndFigures } from "api/common/useGetPortfoliosWithProfileAndFigures";
import {
  Button,
  Card,
  ComboBox,
  ErrorMessage,
  Input,
  LoadingIndicator,
} from "components";
import type { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { useFilteredPortfolioSelect } from "components/TradingModals/useFilteredPortfolioSelect";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useWizard } from "providers/WizardProvider";
import { PermissionMode, useFeature } from "services/permissions/usePermission";
import { addMonthlyInvestmentsToPortfolios } from "utils/faBackProfiles/monthlyInvestments";
import { handleNumberInputEvent, handleNumberPasteEvent } from "utils/input";
import { filterPortfolioOptionsByFunction } from "utils/options";
import type { MonthlyInvestmentsWizardState } from "../types";

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
  const { canPfOption: canPfOptionMonthlyInvest } = useFeature(
    PortfolioGroups.MONTHLY_INVESTMENTS,
    RepresentativeTag.MONTHLY_INVESTMENTS,
    PermissionMode.ANY
  );
  const {
    portfolioOptions: portfolioOptionsThatCanMonthlyInvest,
    portfolioId,
  } = useFilteredPortfolioSelect(canPfOptionMonthlyInvest);

  const portfoliosWithValidMonthlyInvestments = useMemo(() => {
    return portfolioData?.portfolios
      ? addMonthlyInvestmentsToPortfolios(portfolioData?.portfolios)
      : [];
  }, [portfolioData?.portfolios]);

  const portfoliosThatCanMonthlyInvestAndHaveNoPlans = useMemo(() => {
    return filterPortfolioOptionsByFunction(
      portfolioOptionsThatCanMonthlyInvest,
      (option) =>
        !portfoliosWithValidMonthlyInvestments.some((p) => p.id === option.id)
    );
  }, [
    portfolioOptionsThatCanMonthlyInvest,
    portfoliosWithValidMonthlyInvestments,
  ]);

  const [selectedPortfolioOption, setSelectedPortfolioOption] = useState<
    PortfolioOption | undefined
  >(
    monthlyInvestmentsWizardState.selectedPortfolioOption ||
      portfoliosThatCanMonthlyInvestAndHaveNoPlans?.find(
        (o) => o?.id === portfolioId
      ) ||
      portfoliosThatCanMonthlyInvestAndHaveNoPlans[0]
  );

  const [portfolio, setPortfolio] = useState<
    PortfolioWithProfileAndFigures | undefined
  >(() =>
    portfolioData?.portfolios?.find(
      (p) => p?.id === selectedPortfolioOption?.id
    )
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
    return monthlyInvestmentsWizardState.amountToInvest?.toString() ?? "";
  });
  const [inputError, setInputError] = useState("");

  useEffect(() => {
    const selectedPortfolio = portfolioData?.portfolios?.find(
      (p) => p?.id === selectedPortfolioOption?.id
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

  if (errorGettingPortfolioData)
    return (
      <div className="p-4 m-auto w-full h-full">
        <ErrorMessage header={t("messages.noCachedDataInfo")}>
          {networkStatus === 4 ? (
            <LoadingIndicator center size="sm" />
          ) : (
            <Button
              id="monthlyInvestmentsWizard-refetchPortfolioDataButton"
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
              id="monthlyInvestmentsWizard-portfolioSelector"
              disabled={monthlyInvestmentsWizardState.isEditing ?? false}
              label={t(
                "wizards.monthlyInvestments.stepOne.portfolioInputLabel"
              )}
              onChange={setSelectedPortfolioOption}
              options={portfoliosThatCanMonthlyInvestAndHaveNoPlans}
              value={selectedPortfolioOption}
            />
            <Input
              id="monthlyInvestmentsWizard-amountInput"
              error={inputError}
              type="number"
              value={inputValue}
              onChange={(e) =>
                handleNumberInputEvent(e, setInputValue, 0, undefined, 0)
              }
              onPaste={(e) =>
                handleNumberPasteEvent(e, setInputValue, 0, undefined, 0)
              }
              className="text-black rounded-lg"
              label={t("wizards.monthlyInvestments.stepOne.amountInputLabel", {
                currency: portfolioCurrencyCode,
              })}
              placeholder={t(
                "wizards.monthlyInvestments.stepOne.amountInputPlaceholder"
              )}
              step="any"
            />
            {!!minAmount && (
              <p
                id="monthlyInvestmentsWizard-minAmountDisclaimer"
                className="text-sm font-thin"
              >
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
