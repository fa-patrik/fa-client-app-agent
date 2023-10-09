import { FormEvent, useEffect, useState } from "react";
import { Card, Input, LabeledDiv } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useWizard } from "providers/WizardProvider";
import {
  SelectMonthsGrid,
  months,
} from "wizards/monthlySavings/components/SelectedMonthsGrid";
import { MonthlyInvestmentsWizardState } from "../types";

/**
 * Step four of the monthly savings process.
 * The user selects and savings schedule.
 */
const StepFour = () => {
  const { wizardData, setWizardData } =
    useWizard<MonthlyInvestmentsWizardState>();
  const monthlyInvestmentsWizardState = wizardData.data;
  const { t, i18n } = useModifiedTranslation();

  const [selectedDate, setSelectedDate] = useState<string>(
    monthlyInvestmentsWizardState.selectedDate || "1"
  );

  const [inputError, setInputError] = useState("");

  const handleDateInput = (e: FormEvent<HTMLInputElement>) => {
    let newValue = e.currentTarget.value
      .replace(/[^0-9]/g, "")
      .replace(/^0+/, "");

    // Ensure newValue is not greater than 31
    if (Number(newValue) > 31) {
      newValue = "31";
    }
    if (!newValue) {
      setInputError(" ");
    } else {
      setInputError("");
    }
    setSelectedDate(newValue);
  };

  const [selectedMonths, setSelectedMonths] = useState<Record<string, boolean>>(
    monthlyInvestmentsWizardState.selectedMonths ||
      months.reduce((prev, curr) => {
        prev[curr] = true;
        return prev;
      }, {} as Record<string, boolean>)
  );

  useEffect(() => {
    //no month is selected -> disable next
    const disableNext =
      !Object.values(selectedMonths).some((value) => value) || !selectedDate;
    const disableBack = false;

    setWizardData((prevState) => ({
      ...prevState,
      nextDisabled: disableNext,
      backDisabled: disableBack,
      data: {
        ...prevState.data,
        selectedMonths,
        selectedDate,
      },
    }));
  }, [selectedDate, selectedMonths, setWizardData]);

  const nrOfMonthsToSave = Object.values(selectedMonths).reduce(
    (prev: number, curr) => {
      if (curr) prev++;
      return prev;
    },
    0
  );

  const yearlyInvestmentAmount =
    (monthlyInvestmentsWizardState.amountToInvest || 0) * nrOfMonthsToSave;

  return (
    <div className="p-2 m-auto w-full max-w-md">
      <Card id="savingsScheduleCard">
        <div className="flex flex-col gap-y-4 items-center py-6">
          <Input
            error={inputError}
            id="buyDateInput"
            label={t("wizards.monthlyInvestments.stepFour.buyDateInputLabel")}
            tooltipContent={t(
              "wizards.monthlyInvestments.stepFour.buyDateDialogDescription"
            )}
            onChange={handleDateInput}
            value={selectedDate}
          />

          <SelectMonthsGrid
            selected={selectedMonths}
            onSelect={setSelectedMonths}
          />

          <LabeledDiv
            id="totalInvestmentsPerYear"
            className="font-semibold"
            label={t(
              "wizards.monthlyInvestments.stepFour.totalInvestmentsPerYear"
            )}
          >
            {yearlyInvestmentAmount.toLocaleString(i18n.language, {
              style: "currency",
              currency:
                monthlyInvestmentsWizardState.selectedPortfolioOption?.details
                  ?.currency?.securityCode,
            })}
          </LabeledDiv>
        </div>
      </Card>
    </div>
  );
};

export default StepFour;
