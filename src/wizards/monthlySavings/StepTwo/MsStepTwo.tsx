import { FormEvent, useEffect, useState } from "react";
import { Card, Input, LabeledDiv } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useWizard } from "providers/WizardProvider";
import { SelectMonthsGrid } from "../components/SelectedMonthsGrid";
import { MonthlySavingsWizardState } from "../types";

const months = Array(12)
  .fill(undefined)
  .map((_, idx) => {
    return idx + 1;
  });

/**
 * Step four of the monthly savings process.
 * The user selects and savings schedule.
 */
const MsStepTwo = () => {
  const { wizardData, setWizardData } = useWizard<MonthlySavingsWizardState>();
  const { t, i18n } = useModifiedTranslation();
  const [selectedDate, setSelectedDate] = useState<string>(
    wizardData.data.selectedDate || "1"
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

  const [selectedMonths, setSelectedMonths] = useState<Record<number, boolean>>(
    wizardData.data.selectedMonths ||
      months.reduce((prev, curr) => {
        prev[curr] = true;
        return prev;
      }, {} as Record<number, boolean>)
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

  const yearlySavingsAmount =
    (wizardData.data?.amountToSave || 0) * nrOfMonthsToSave;

  return (
    <div className="p-2 m-auto w-full max-w-md">
      <Card id="savingsScheduleCard">
        <div className="flex flex-col gap-y-4 items-center py-6">
          <Input
            error={inputError}
            id="dateInput"
            label={t("wizards.monthlySavings.stepTwo.paymentDateInputLabel")}
            tooltipContent={t(
              "wizards.monthlySavings.stepTwo.paymentDateDialogDescription"
            )}
            onChange={handleDateInput}
            value={selectedDate}
          />

          <SelectMonthsGrid
            selected={selectedMonths}
            onSelect={setSelectedMonths}
          />

          <LabeledDiv
            id="totalSavingsPerYear"
            className="font-semibold"
            label={t("wizards.monthlySavings.stepTwo.totalSavingsPerYear")}
          >
            {yearlySavingsAmount.toLocaleString(i18n.language, {
              style: "currency",
              currency:
                wizardData.data.selectedPortfolioOption?.details?.currency
                  ?.securityCode,
            })}
          </LabeledDiv>
        </div>
      </Card>
    </div>
  );
};

export default MsStepTwo;
