import { useEffect, useState } from "react";
import { Card, Input, PortfolioSelect } from "components";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { useFilteredPortfolioSelect } from "components/TradingModals/useFilteredPortfolioSelect";
import { useWizard } from "providers/WizardProvider";
import { canPortfolioOptionMonthlyInvest } from "services/permissions/usePermission";

//min units of money to invest
const PF_KEYFIGURE_CODE_MIN_AMOUNT = "CP_MI_MINAMOUNT";

/**
 * Step one of the monthly investments process.
 * The user selects the securities to invest into.
 */
const StepOne = () => {
  const { wizardData, setWizardData } = useWizard();
  const { portfolioOptions } = useFilteredPortfolioSelect(
    canPortfolioOptionMonthlyInvest
  );
  const [selectedPortfolioOption, setSelectedPortfolioOption] =
    useState<PortfolioOption>(
      wizardData?.data?.selectedPortfolioOption || portfolioOptions[0]
    );
  const minAmount =
    selectedPortfolioOption.details?.figuresAsObject?.latestValues[
      PF_KEYFIGURE_CODE_MIN_AMOUNT
    ]?.value;

  const portfolioCurrencyCode =
    selectedPortfolioOption.details?.currency.securityCode;

  const [inputValue, setInputValue] = useState(() => {
    if (minAmount && wizardData?.data?.amountToInvest < minAmount) {
      return minAmount;
    }
    return wizardData?.data?.amountToInvest || 100;
  });
  const [inputError, setInputError] = useState("");

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
      setInputError("Value is below the minimum amount");
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
  }, [inputValue, setWizardData, minAmount]);

  useEffect(() => {
    setWizardData((prevState) => ({
      ...prevState,
      data: {
        ...prevState.data,
        selectedPortfolio: selectedPortfolioOption.details,
      },
    }));
  }, [selectedPortfolioOption, setWizardData]);

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

  return (
    <div className="flex flex-col gap-y-3">
      <Card>
        <div className="flex flex-col gap-y-3 p-6">
          <p className="mx-auto text-lg font-bold">Portfolio selection</p>
          <PortfolioSelect
            label="Select portfolio"
            onChange={setSelectedPortfolioOption}
            portfolioId={selectedPortfolioOption.id}
            portfolioOptions={portfolioOptions}
          />
          <Input
            error={inputError}
            type="number"
            value={inputValue}
            onChange={(e) => handleInput(e)}
            onPaste={(e) => handlePaste(e)}
            className="text-black rounded-lg"
            label={`Amount in ${portfolioCurrencyCode}`}
            placeholder={`${minAmount || 100}`}
          />
          {minAmount && (
            <p className="text-sm font-thin">
              Min. {minAmount} {portfolioCurrencyCode}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default StepOne;
