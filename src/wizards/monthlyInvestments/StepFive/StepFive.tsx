import { useEffect, useState } from "react";
import { TradableSecurity } from "api/trading/useGetTradebleSecurities";
import {
  PortfolioMonthlyInvestmentsDTOInput,
  useSetMonthlyInvestments,
} from "api/trading/useSetMonthlyInvestments";
import { Card } from "components";
import { Option } from "components/ComboBox/ComboBox";
import { ConfirmDialog } from "components/Dialog/ConfirmDialog";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import SelectGrid from "components/SelectGrid/SelectGrid";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import numbro from "numbro";
import { useKeycloak } from "providers/KeycloakProvider";
import { useWizard } from "providers/WizardProvider";
import SecurityDistributionTable from "./SecurityDistributionTable";

/**
 * Monthly investments profile -> Enable monthly investments
 * in portfolio currency checkbox.
 */
const ENABLE_IN_PF_CURRENCY = true;

const months = Array(12)
  .fill(undefined)
  .map((_, idx) => {
    return idx;
  });

/**
 * Step five of the monthly investments process.
 * The user confirms all previous choices.
 * An API request is made to FA Back.
 */
const StepFive = () => {
  const { impersonating } = useKeycloak();
  const { wizardData, setWizardData } = useWizard();
  const { t, i18n } = useModifiedTranslation();
  numbro.setLanguage(i18n.language);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { setMonthlyInvestments } = useSetMonthlyInvestments();
  const [loadingFinish, setLoadingFinish] = useState(false);
  const selectedPortfolioOption: PortfolioOption | undefined =
    wizardData.data.selectedPortfolioOption;
  const amountToInvest: number = wizardData.data.amountToInvest || 0;
  const amountDistribution: Record<string, number> | undefined =
    wizardData.data.amountDistribution;
  const selectedSecurities: TradableSecurity[] | undefined =
    wizardData.data.selectedSecurities?.filter((security: TradableSecurity) => {
      //remove securities for which the user has input 0 as amount
      return amountDistribution && amountDistribution[security.id] > 0;
    });

  const percentageDistribution: Record<string, number> | undefined =
    wizardData.data.percentageDistribution;
  const selectedDate: Option = wizardData.data.selectedDate;
  const [selectedMonths, setSelectedMonths] = useState<Record<string, boolean>>(
    wizardData.data.selectedMonths ||
      months.reduce((prev, curr) => {
        prev[curr] = true;
        return prev;
      }, {} as Record<string, boolean>)
  );
  const monthsAsString = months.map((dateNr) => {
    const date = new Date();
    date.setMonth(dateNr);
    return {
      id: `${dateNr}`,
      label: date.toLocaleString(i18n.language, { month: "long" }),
    };
  });
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
    const monthlyInvestmentProfile:
      | PortfolioMonthlyInvestmentsDTOInput
      | undefined = selectedSecurities?.reduce(
      (prev, curr: TradableSecurity) => {
        //populate new row in the profile
        prev.rows.push({
          date: Number(selectedDate.id),
          selectedMonths: Object.keys(selectedMonths).reduce(
            (prev, currMonthNr) => {
              if (selectedMonths[currMonthNr])
                prev.push(Number(currMonthNr) + 1);
              return prev;
            },
            [] as number[]
          ),
          security: curr.securityCode,
          amount: amountDistribution?.[curr.id] || 0,
        });
        return prev;
      },
      {
        portfolio: selectedPortfolioShortName,
        enableInPfCurrency: ENABLE_IN_PF_CURRENCY,
        rows: [],
      } as PortfolioMonthlyInvestmentsDTOInput
    );

    //send mutation to FA Back
    if (selectedPortfolioShortName && monthlyInvestmentProfile) {
      await setMonthlyInvestments(monthlyInvestmentProfile);
    }
    //close the open dialog and go back to step 0
    setLoadingFinish(false);
    setConfirmDialogOpen(false);
    wizardData?.onReset?.();
  };

  const selectedSecuritiesSortedByPercentageDistribution =
    selectedSecurities?.sort(
      (secA: TradableSecurity, secB: TradableSecurity) => {
        const numericalOrder =
          (percentageDistribution?.[secB.id] || 0) -
          (percentageDistribution?.[secA.id] || 0);
        if (numericalOrder === 0) {
          //equally large- sort by name
          return secA.name.localeCompare(secB.name);
        } else {
          return numericalOrder;
        }
      }
    );

  return (
    <div className="flex flex-col gap-y-3">
      <Card>
        <div className="flex flex-col gap-y-3 p-2 select-none">
          <p className="mx-auto text-lg font-bold">
            {t("wizards.monthlyInvestments.stepFive.summaryTitle")}
          </p>
          <ul className="flex flex-col gap-y-2 w-full text-sm">
            <li className="flex">
              <p className="w-1/2">Portfolio</p>
              <p className="w-1/2 font-bold text-right">
                {selectedPortfolioOption?.details?.name}
              </p>
            </li>
            <li className="flex justify-between">
              <p>{t("wizards.monthlyInvestments.stepFive.amount")}</p>
              <p id="amountToInvest" className="font-bold">
                {amountToInvest?.toLocaleString(i18n.language, {
                  style: "currency",
                  currency:
                    wizardData.data.selectedPortfolio?.currency?.securityCode,
                })}
              </p>
            </li>
            <li className="flex justify-between">
              <p>{t("wizards.monthlyInvestments.stepFive.yearlyAmount")}</p>
              <p id="yearlyAmount" className="font-bold">
                {yearlyInvestmentAmount?.toLocaleString(i18n.language, {
                  style: "currency",
                  currency:
                    wizardData.data.selectedPortfolio?.currency?.securityCode,
                })}
              </p>
            </li>
          </ul>
          <hr className="w-full border-1" />
          <p>
            {t(
              "wizards.monthlyInvestments.stepFive.securityDistributionTableTitle"
            )}
          </p>
          <div className="overflow-x-auto w-full">
            <SecurityDistributionTable
              totalAmount={wizardData.data.amountToInvest}
              securities={selectedSecuritiesSortedByPercentageDistribution}
              amountDistribution={amountDistribution}
              portfolioCurrencyCode={
                wizardData.data.selectedPortfolio?.currency?.securityCode
              }
            />
          </div>
          <hr className="w-full border-1" />
          <ul className="flex flex-col gap-y-2 w-full text-sm">
            <li className="flex">
              <p className="w-1/2">
                {t("wizards.monthlyInvestments.stepFive.buyDate")}
              </p>
              <p id={`selectedDate`} className="w-1/2 font-bold text-right">
                {t("wizards.monthlyInvestments.stepFive.selectedBuyDate", {
                  date: numbro(Number(selectedDate.id || 0)).format("0o"),
                })}
              </p>
            </li>
          </ul>
          <p>
            {t("wizards.monthlyInvestments.stepFive.monthsSelectedGridTitle")}
          </p>
          <div className="flex justify-start w-full">
            <SelectGrid
              id="selectableMonthsGrid"
              disabled
              selected={selectedMonths}
              onSelect={setSelectedMonths}
              selectBoxes={monthsAsString}
              narrow
            />
          </div>
        </div>
      </Card>
      <ConfirmDialog
        title={t("wizards.monthlyInvestments.stepFive.confirmDialogTitle")}
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
        disabled={impersonating}
      />
    </div>
  );
};

export default StepFive;
