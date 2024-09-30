import { useEffect, useState } from "react";
import { TradableSecurity } from "api/trading/useGetTradebleSecurities";
import { useSetMonthlyInvestments } from "api/trading/useSetMonthlyInvestments";
import { Card } from "components";
import { ConfirmDialog } from "components/Dialog/ConfirmDialog";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import numbro from "numbro";
import { useKeycloak } from "providers/KeycloakProvider";
import { useWizard } from "providers/WizardProvider";
import { convertWizardStateToApiFormat } from "utils/faBackProfiles/monthlyInvestments";
import {
  SelectMonthsGrid,
  months,
} from "wizards/monthlySavings/components/SelectedMonthsGrid";
import { MonthlyInvestmentsWizardState } from "../types";
import SecurityDistributionTable from "./SecurityDistributionTable";

/**
 * Step five of the monthly investments process.
 * The user confirms all previous choices.
 * An API request is made to FA Back.
 */
const StepFive = () => {
  const { access } = useKeycloak();
  const { wizardData, setWizardData } =
    useWizard<MonthlyInvestmentsWizardState>();
  const monthlyInvestmentsWizardState = wizardData.data;
  const { t, i18n } = useModifiedTranslation();
  const locale =
    i18n.language === i18n.resolvedLanguage
      ? i18n.language
      : i18n.resolvedLanguage;
  numbro.setLanguage(locale);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { setMonthlyInvestments } = useSetMonthlyInvestments();
  const [loadingFinish, setLoadingFinish] = useState(false);
  const selectedPortfolioOption =
    monthlyInvestmentsWizardState.selectedPortfolioOption;
  const amountToInvest = monthlyInvestmentsWizardState.amountToInvest || 0;
  const amountDistribution = monthlyInvestmentsWizardState.amountDistribution;
  const selectedSecurities = monthlyInvestmentsWizardState.selectedSecurities;

  const selectedDate = monthlyInvestmentsWizardState.selectedDate;
  const [selectedMonths] = useState<Record<string, boolean>>(
    monthlyInvestmentsWizardState.selectedMonths ||
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

  const yearlyInvestmentAmount = amountToInvest * nrOfMonthsToInvest;

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
   * Creates a Monthly Investment Profile
   * and sends a mutation to FA Back.
   */
  const handleFinishConfirm = async () => {
    //The user might want to add 5 securities (rows) to the monthly investment profile.
    //However, the user might have had SUPPORTED_ROWS_MONTHLY_INVESTMENTS securities there previously.
    //We need to reset the rows that will not be populated. Otherwise, they will stay the same.
    setLoadingFinish(true);
    const selectedPortfolioShortName =
      selectedPortfolioOption?.details?.shortName;
    const monthlyInvestmentProfile = convertWizardStateToApiFormat(
      wizardData.data
    );

    //send mutation to FA Back
    if (selectedPortfolioShortName && monthlyInvestmentProfile) {
      await setMonthlyInvestments(
        monthlyInvestmentProfile,
        monthlyInvestmentsWizardState.isEditing ? "Edit" : "New"
      );
    }
    //close the open dialog and go back to step 0
    setLoadingFinish(false);
    setConfirmDialogOpen(false);
    wizardData?.onReset?.();
  };

  const selectedSecuritiesSortedByAmountDistribution = selectedSecurities?.sort(
    (secA: TradableSecurity, secB: TradableSecurity) => {
      const numericalOrder =
        (Number(amountDistribution?.[secB.id]) || 0) -
        (Number(amountDistribution?.[secA.id]) || 0);
      if (numericalOrder === 0) {
        //equally large- sort by name
        return secA.name.toLowerCase().localeCompare(secB.name.toLowerCase());
      } else {
        return numericalOrder;
      }
    }
  );

  return (
    <div className="flex overflow-y-auto flex-col gap-y-4 p-4 m-auto w-full max-w-xl">
      <div>
        <Card>
          <div className="flex flex-col gap-y-3 py-3 px-4">
            <p className="mx-auto text-lg font-semibold">
              {t("wizards.monthlyInvestments.stepFive.summaryTitle")}
            </p>
            <ul className="flex flex-col gap-y-2 w-full text-sm">
              <li className="flex">
                <p className="w-1/2">
                  {t("wizards.monthlyInvestments.stepFive.portfolio")}
                </p>
                <p
                  id="monthlyInvestmentsWizard-portfolioName"
                  className="w-1/2 font-semibold text-right"
                >
                  {selectedPortfolioOption?.details?.name}
                </p>
              </li>
              <li className="flex justify-between">
                <p>{t("wizards.monthlyInvestments.stepFive.amount")}</p>
                <p
                  id="monthlyInvestmentsWizard-amountToInvest"
                  className="font-semibold"
                >
                  {t("numberWithCurrency", {
                    value: amountToInvest,
                    currency:
                      monthlyInvestmentsWizardState.selectedPortfolioOption
                        ?.details?.currency?.securityCode,
                  })}
                </p>
              </li>
              <li className="flex justify-between">
                <p>{t("wizards.monthlyInvestments.stepFive.yearlyAmount")}</p>
                <p
                  id="monthlyInvestmentsWizard-yearlyAmountToInvest"
                  className="font-semibold"
                >
                  {t("numberWithCurrency", {
                    value: yearlyInvestmentAmount,
                    currency:
                      monthlyInvestmentsWizardState.selectedPortfolioOption
                        ?.details?.currency?.securityCode,
                  })}
                </p>
              </li>
            </ul>
            <hr className="w-full border-1" />
            <div className="overflow-x-auto w-full">
              <SecurityDistributionTable
                id="monthlyInvestmentsWizard-securityDistributionTable"
                totalAmount={monthlyInvestmentsWizardState.amountToInvest || 0}
                securities={selectedSecuritiesSortedByAmountDistribution}
                amountDistribution={amountDistribution}
                portfolioCurrencyCode={
                  monthlyInvestmentsWizardState.selectedPortfolioOption?.details
                    ?.currency?.securityCode || ""
                }
              />
            </div>
            <hr className="w-full border-1" />
            <ul className="flex flex-col gap-y-2 w-full text-sm">
              <li className="flex">
                <p className="w-1/2">
                  {t("wizards.monthlyInvestments.stepFive.buyDate")}
                </p>
                <p
                  id="monthlyInvestmentsWizard-buyDate"
                  className="w-1/2 font-semibold text-right"
                >
                  {t("wizards.monthlyInvestments.stepFive.selectedBuyDate", {
                    date: numbro(Number(selectedDate || 0)).format("0o"),
                  })}
                </p>
              </li>
            </ul>
            <p className="text-sm">
              {t("wizards.monthlyInvestments.stepFive.monthsSelectedGridTitle")}
            </p>
            <div className="w-full">
              <SelectMonthsGrid
                id="monthlyInvestmentsWizard-selectableMonths"
                disabled
                selected={selectedMonths}
                narrow
              />
            </div>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        id="monthlyInvestmentsWizard-confirmPlanDialog"
        title={
          monthlyInvestmentsWizardState.isEditing
            ? t("wizards.monthlyInvestments.stepFive.confirmEditDialogTitle")
            : t("wizards.monthlyInvestments.stepFive.confirmDialogTitle")
        }
        description={t(
          "wizards.monthlyInvestments.stepFive.confirmDialogDescription"
        )}
        confirmButtonText={t(
          "wizards.monthlyInvestments.stepFive.confirmDialogConfirmButtonLabel"
        )}
        cancelButtonText={t(
          "wizards.monthlyInvestments.stepFive.confirmDialogCancelButtonLabel"
        )}
        onConfirm={async () => await handleFinishConfirm()}
        isOpen={confirmDialogOpen}
        setIsOpen={setConfirmDialogOpen}
        loading={loadingFinish}
        disabled={!access.buy}
      />
    </div>
  );
};

export default StepFive;
