import { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
import { Card, ComboBox, LabeledDiv } from "components";
import { Option } from "components/ComboBox/ComboBox";
import SelectGrid from "components/SelectGrid/SelectGrid";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useWizard } from "providers/WizardProvider";

const months = Array(12)
  .fill(undefined)
  .map((_, idx) => {
    return idx;
  });

const dateOptions = Array(31)
  .fill(undefined)
  .map((_, idx) => ({ id: `${idx + 1}`, label: `${idx + 1}` }));
/**
 * Step four of the monthly investments process.
 * The user selects and investment schedule.
 */
const StepFour = () => {
  const { wizardData, setWizardData } = useWizard();
  const { t, i18n } = useModifiedTranslation();
  const monthsAsString = months.map((dateNr) => {
    const date = new Date();
    date.setMonth(dateNr);
    return {
      id: `${dateNr}`,
      label: date.toLocaleString(i18n.language, { month: "long" }),
    };
  });

  const [selectedDate, setSelectedDate] = useState<Option>(
    wizardData.data.selectedDate || dateOptions[0]
  );
  const [selectedMonths, setSelectedMonths] = useState<Record<string, boolean>>(
    wizardData.data.selectedMonths ||
      months.reduce((prev, curr) => {
        prev[curr] = true;
        return prev;
      }, {} as Record<string, boolean>)
  );

  const [toggleSelectAll, setToggleSelectAll] = useState(true);

  useEffect(() => {
    //no month is selected -> disable next
    const disableNext = !Object.values(selectedMonths).some((value) => value);
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

  const nrOfMonthsToInvest = Object.values(selectedMonths).reduce(
    (prev: number, curr) => {
      if (curr) prev++;
      return prev;
    },
    0
  );

  const yearlyInvestmentAmount =
    wizardData.data.amountToInvest * nrOfMonthsToInvest;

  return (
    <div className="flex flex-col gap-y-3">
      <Card id="investmentScheduleCard">
        <div className="flex flex-col gap-y-4 items-center p-6 select-none">
          <div className="z-10">
            <ComboBox
              id="buyDateInput"
              label={t("wizards.monthlyInvestments.stepFour.buyDateInputLabel")}
              tooltipContent={t("wizards.monthlyInvestments.stepFour.buyDateDialogDescription")}
              options={dateOptions}
              onChange={setSelectedDate}
              value={selectedDate}
            />
          </div>

          <div className="flex gap-x-3 items-center">
            <p className="text-sm font-thin">
              {!toggleSelectAll ? t("wizards.monthlyInvestments.stepFour.selectAllMonthsToggleLabel"): t("wizards.monthlyInvestments.stepFour.deselectAllMonthsToggleLabel")}
            </p>
            <Switch
              id="toggleAllMonthsSwitch"
              checked={toggleSelectAll}
              onChange={(checked) => {
                setSelectedMonths((prev) => {
                  const newState = { ...prev };
                  Object.keys(newState).forEach((v) => (newState[v] = checked));
                  return newState;
                });
                setToggleSelectAll(checked);
              }}
              className={`${
                toggleSelectAll ? "bg-green-500" : "bg-gray-300"
              } relative inline-flex h-6 w-11 items-center rounded-full`}
            >
              <span className="sr-only">
                {toggleSelectAll ? "Select" : "Unselect"} all months
              </span>
              <span
                className={`${
                  toggleSelectAll ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </Switch>
          </div>
          <SelectGrid
            id="selectableMonthsGrid"
            selected={selectedMonths}
            onSelect={setSelectedMonths}
            selectBoxes={monthsAsString}
          />

          <LabeledDiv className="font-bold" label={t("wizards.monthlyInvestments.stepFour.totalInvestmentsPerYear")}>
            {yearlyInvestmentAmount.toLocaleString(i18n.language, {
              style: "currency",
              currency:
                wizardData.data.selectedPortfolio?.currency?.securityCode,
            })}
          </LabeledDiv>
        </div>
      </Card>
    </div>
  );
};

export default StepFour;
