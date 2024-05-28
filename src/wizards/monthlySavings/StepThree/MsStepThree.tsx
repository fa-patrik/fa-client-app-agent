import { useEffect, useState } from "react";
import { CashAccount } from "api/money/useGetPortfoliosAccounts";
import {
  PortfolioMonthlySavingsDTOInput,
  useSetMonthlySavings,
} from "api/money/useSetMonthlySavings";
import { Card } from "components";
import { ConfirmDialog } from "components/Dialog/ConfirmDialog";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import numbro from "numbro";
import { useWizard } from "providers/WizardProvider";
import { useRolePermissions } from "services/permissions/useRolePermissions";
import { SelectMonthsGrid, months } from "../components/SelectedMonthsGrid";
import { MonthlySavingsWizardState } from "../types";

/**
 * Final step of the monthly savings process.
 * The user confirms all previous choices.
 * An API request is made to FA Back.
 */
const MsStepThree = () => {
  const { canSave } = useRolePermissions();
  const { wizardData, setWizardData } = useWizard<MonthlySavingsWizardState>();
  const { t, i18n } = useModifiedTranslation();
  numbro.setLanguage(i18n.language);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { setMonthlySavings } = useSetMonthlySavings();
  const [loadingFinish, setLoadingFinish] = useState(false);
  const selectedPortfolioOption: PortfolioOption | undefined =
    wizardData.data.selectedPortfolioOption;
  const selectedAccount: CashAccount | undefined =
    wizardData.data.selectedAccount;
  const amountToSave: number = wizardData.data.amountToSave || 0;

  const selectedDate: string | undefined = wizardData.data.selectedDate;
  const [selectedMonths] = useState<Record<string, boolean>>(
    wizardData.data.selectedMonths ||
      months.reduce((prev, curr) => {
        prev[curr] = true;
        return prev;
      }, {} as Record<string, boolean>)
  );

  const nrOfMonthsToInvest = Object.values(selectedMonths).reduce(
    (prev: number, curr) => {
      if (curr) prev++;
      return prev;
    },
    0
  );

  const yearlyInvestmentAmount = amountToSave * nrOfMonthsToInvest;

  //when user clicks Finish in the Wizard
  const handleFinish = () => {
    setConfirmDialogOpen(true);
  };

  //attach the finish function to the Wizard
  useEffect(() => {
    setWizardData((prevState) => ({
      ...prevState,
      onFinish: handleFinish,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Creates a Monthly Savings Profile
   * and sends a mutation to FA Back.
   */
  const handleFinishConfirm = async () => {
    setLoadingFinish(true);
    const selectedPortfolioShortName =
      selectedPortfolioOption?.details?.shortName;
    const monthlySavingsProfile: PortfolioMonthlySavingsDTOInput = {
      enable: true,
      portfolio: selectedPortfolioShortName ?? "",
      selectedMonths: Object.keys(selectedMonths).reduce(
        (prev, currMonthNr) => {
          if (selectedMonths[currMonthNr]) prev.push(Number(currMonthNr));
          return prev;
        },
        [] as number[]
      ),
      amount: amountToSave,
      date: Number(selectedDate),
    };

    //send mutation to FA Back
    if (selectedPortfolioShortName && monthlySavingsProfile) {
      await setMonthlySavings(monthlySavingsProfile);
    }
    //close the open dialog and go back to step 0
    setLoadingFinish(false);
    setConfirmDialogOpen(false);
    wizardData?.onReset?.();
  };

  return (
    <div className="p-2 m-auto w-full max-w-md">
      <Card>
        <div className="flex flex-col gap-y-3 p-6">
          <p className="mx-auto text-lg font-semibold">
            {t("wizards.monthlySavings.stepThree.summaryTitle")}
          </p>
          <ul className="flex flex-col gap-y-2 w-full text-sm">
            <li className="flex">
              <p className="w-1/2">
                {t("wizards.monthlySavings.stepThree.portfolio")}
              </p>
              <p
                className="w-1/2 text-sm font-semibold text-right"
                id="monthlySavingsWizard-portfolioName"
              >
                {selectedPortfolioOption?.details?.name}
              </p>
            </li>
            <li className="flex">
              <p className="w-1/2">
                {t("wizards.monthlySavings.stepThree.account")}
              </p>
              <p
                className="w-1/2 text-sm font-semibold text-right"
                id="monthlySavingsWizard-debitAccountNumber"
              >
                {selectedAccount?.number}
              </p>
            </li>
            <hr className="w-full border-1" />
            <li className="flex justify-between">
              <p>{t("wizards.monthlySavings.stepThree.amount")}</p>
              <p
                className="text-sm font-semibold"
                id="monthlySavingsWizard-amountToSave"
              >
                {amountToSave?.toLocaleString(i18n.language, {
                  style: "currency",
                  currency:
                    wizardData.data.selectedPortfolioOption?.details?.currency
                      ?.securityCode,
                })}
              </p>
            </li>
            <li className="flex justify-between">
              <p>{t("wizards.monthlySavings.stepThree.yearlyAmount")}</p>
              <p
                className="text-sm font-semibold"
                id="monthlySavingsWizard-yearlyAmountToSave"
              >
                {yearlyInvestmentAmount?.toLocaleString(i18n.language, {
                  style: "currency",
                  currency:
                    wizardData.data.selectedPortfolioOption?.details?.currency
                      ?.securityCode,
                })}
              </p>
            </li>
          </ul>

          <hr className="w-full border-1" />
          <ul className="flex flex-col gap-y-2 w-full text-sm">
            <li className="flex">
              <p className="w-1/2">
                {t("wizards.monthlySavings.stepThree.paymentDate")}
              </p>
              <p
                id="monthlySavingsWizard-paymentDate"
                className="w-1/2 text-sm font-semibold text-right"
              >
                {t("wizards.monthlySavings.stepThree.selectedPaymentDate", {
                  date: numbro(Number(selectedDate)).format("0o"),
                })}
              </p>
            </li>
          </ul>
          <p className="text-sm">
            {t("wizards.monthlySavings.stepThree.monthsSelectedGridTitle")}
          </p>
          <SelectMonthsGrid
            id="monthlySavingsWizard-selectableMonths"
            disabled
            selected={selectedMonths}
            narrow
          />
        </div>
      </Card>
      <ConfirmDialog
        id="monthlySavingsWizard-confirmPlanDialog"
        title={t("wizards.monthlySavings.stepThree.confirmDialogTitle")}
        description={t(
          "wizards.monthlySavings.stepThree.confirmDialogDescription"
        )}
        confirmButtonText={t(
          "wizards.monthlySavings.stepThree.confirmDialogConfirmButtonLabel"
        )}
        cancelButtonText={t(
          "wizards.monthlySavings.stepThree.confirmDialogCancelButtonLabel"
        )}
        onConfirm={async () => await handleFinishConfirm()}
        isOpen={confirmDialogOpen}
        setIsOpen={setConfirmDialogOpen}
        loading={loadingFinish}
        disabled={!canSave}
      />
    </div>
  );
};

export default MsStepThree;
