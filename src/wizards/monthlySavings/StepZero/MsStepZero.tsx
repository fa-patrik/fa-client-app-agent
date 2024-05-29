import { useEffect, useState } from "react";
import {
  PortfolioMonthlySavingsDTOInput,
  useSetMonthlySavings,
} from "api/money/useSetMonthlySavings";
import { ReactComponent as ExclamationIcon } from "assets/exclamation-circle.svg";
import { ReactComponent as PlusIcon } from "assets/plus-circle.svg";
import { Badge, Button, Card, LoadingIndicator } from "components";
import { Severity } from "components/Alert/Alert";
import { ConfirmDialog } from "components/Dialog/ConfirmDialog";
import { useFilteredPortfolioSelect } from "components/TradingModals/useFilteredPortfolioSelect";
import { getPortfolioOption } from "hooks/useGetPortfolioOptions";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import numbro from "numbro";
import { useWizard } from "providers/WizardProvider";
import {
  canPortfolioMonthlySave,
  canPortfolioOptionMonthlySave,
} from "services/permissions/trading";
import { useRolePermissions } from "services/permissions/useRolePermissions";
import { getDefaultValueAsNumber } from "utils/faBackProfiles/common";
import {
  MonthlySavings,
  MonthlySavingsFieldId,
  PortfolioWithMonthlySavings,
  addMonthlySavingsToPortfolios,
  getSelectedMonths,
  getSelectedMonthsAsMap,
} from "utils/faBackProfiles/monthlySavings";
import { WizardBottomNavigationReplica } from "../../components/WizardBottomNavigationReplica";
import OnError from "../components/OnError";
import { SelectMonthsGrid } from "../components/SelectedMonthsGrid";
import {
  PortfolioProfileAndFiguresAndAccounts,
  getUniqueExternalAccounts,
  useGetPortfoliosProfileAndFiguresAndAccounts,
} from "./api/useGetPortfoliosWithProfileAndAccounts";

/**
 * Initial step of the monthly savings wizard.
 * Displays existing monthly savings setup
 * and a button to add a new one.
 */
const MsStepZero = () => {
  const { canSave } = useRolePermissions();
  const { setWizardData, wizardData } = useWizard();
  const {
    data: portfolioData,
    refetch: refetchPortfolioData,
    loading: loadingPortfolioData,
    error: errorGettingPortfolioData,
    networkStatus,
  } = useGetPortfoliosProfileAndFiguresAndAccounts(true);
  const portfolios = portfolioData?.portfolios;
  //the portfolios have unstructured profile data
  //so we add a strutured property to them for easier use
  const [portfoliosWithMonthlySavings, setPortoliosWithMonthlySavings] =
    useState<
      (PortfolioProfileAndFiguresAndAccounts & MonthlySavings)[] | undefined
    >(() => {
      if (portfolioData?.portfolios) {
        return addMonthlySavingsToPortfolios(portfolioData?.portfolios);
      } else {
        return undefined;
      }
    });

  const { t, i18n } = useModifiedTranslation();
  const { setMonthlySavings } = useSetMonthlySavings("Delete");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [targetPortfolio, setTargetPortfolio] = useState<
    PortfolioWithMonthlySavings | undefined
  >(undefined);

  const deleteMonthlySavingsProfile = async () => {
    setLoadingDelete(true);
    if (targetPortfolio) {
      const monthlySavingsProfileToDelete = targetPortfolio.monthlySavings;
      const disabledMonthlySavingsProfile: PortfolioMonthlySavingsDTOInput = {
        enable: false,
        portfolio: targetPortfolio?.shortName,
        amount:
          getDefaultValueAsNumber(
            monthlySavingsProfileToDelete?.[MonthlySavingsFieldId.AMOUNT]
              ?.defaultValue
          ) || 0,
        date:
          getDefaultValueAsNumber(
            monthlySavingsProfileToDelete?.[MonthlySavingsFieldId.DATE]
              ?.defaultValue
          ) || 0,
        selectedMonths: getSelectedMonths(monthlySavingsProfileToDelete),
      };

      await setMonthlySavings(disabledMonthlySavingsProfile);
      await refetchPortfolioData();
      setLoadingDelete(false);
      setConfirmDialogOpen(false);
    }
  };

  useEffect(() => {
    if (portfolios) {
      const portfoliosWithMonthlySavings =
        addMonthlySavingsToPortfolios(portfolios);
      setPortoliosWithMonthlySavings(() => portfoliosWithMonthlySavings);
    }
  }, [portfolios]);

  /**
   * Sets the portfolio's monthly savings profile
   * data into the Wizard data state.
   */
  const editMonthlySavingsProfile = (
    portfolio: PortfolioWithMonthlySavings
  ) => {
    const existingMonthlySavingsProfile = portfolio.monthlySavings;
    if (existingMonthlySavingsProfile) {
      setWizardData((prevData) => ({
        ...prevData,
        step: 1,
        backDisabled: false,
        data: {
          isEditing: true,
          selectedPortfolioOption: getPortfolioOption(portfolio),
          selectedMonths: getSelectedMonthsAsMap(existingMonthlySavingsProfile),
          selectedDate: getDefaultValueAsNumber(
            existingMonthlySavingsProfile[MonthlySavingsFieldId.DATE]
              ?.defaultValue
          ),
          amountToSave: getDefaultValueAsNumber(
            existingMonthlySavingsProfile[MonthlySavingsFieldId.AMOUNT]
              ?.defaultValue
          ),
        },
      }));
    }
  };

  const loading = loadingPortfolioData && !portfoliosWithMonthlySavings;
  const { portfolioOptions } = useFilteredPortfolioSelect(
    canPortfolioOptionMonthlySave
  );
  const allowCreateNew =
    portfolioOptions?.length !== portfoliosWithMonthlySavings?.length;

  const NoAccountWarning = ({ id }: { id: string }) => {
    return (
      <div className="flex items-center p-1 w-full text-sm rounded-lg border bg-amber-50">
        <div>
          <ExclamationIcon className=" mr-2 stroke-amber-600" />
        </div>
        <span className="text-xs text-amber-600" id={id}>
          {t("wizards.monthlySavings.stepZero.noAccountWarning")}
        </span>
      </div>
    );
  };

  const AddNewPlanButton = () => (
    <Button
      id="monthlySavingsWizard-addNewPlanButton"
      isLoading={loadingPortfolioData}
      disabled={loadingPortfolioData}
      LeftIcon={PlusIcon}
      onClick={() => {
        //reset state
        wizardData.onReset?.();
        //set next step
        setWizardData((prevState) => ({
          ...prevState,
          step: 1,
          backDisabled: false,
        }));
      }}
    >
      {t("wizards.monthlySavings.stepZero.addNewPlanButtonLabel")}
    </Button>
  );

  //loading
  if (loading)
    return (
      <div className="p-4 m-auto w-full max-w-md">
        <LoadingIndicator center />
      </div>
    );

  //error and no data to display
  if (errorGettingPortfolioData)
    return (
      <OnError
        id="monthlySavingsWizard-error"
        refetchData={refetchPortfolioData}
        networkStatus={networkStatus}
      />
    );

  //at this point should have enough data to render something useful
  if (
    portfoliosWithMonthlySavings &&
    portfoliosWithMonthlySavings?.length > 0
  ) {
    return (
      <>
        <div className="flex overflow-y-auto flex-col gap-y-4 p-4 m-auto w-full max-w-lg">
          {portfoliosWithMonthlySavings.map((portfolio) => {
            const externalAccounts = getUniqueExternalAccounts(
              portfolio.portfolioReport.accountItems,
              portfolio.accounts
            );
            //usually there is only one debit account per portfolio
            //and as the profile does not specify an account
            //we simply pick the first available, which is
            //the same way as the backend process does
            const debitAccount = externalAccounts?.[0];
            const monthlySavingsProfile = portfolio.monthlySavings;
            const amount = getDefaultValueAsNumber(
              monthlySavingsProfile?.[MonthlySavingsFieldId.AMOUNT]
                ?.defaultValue
            );
            const date = getDefaultValueAsNumber(
              monthlySavingsProfile?.[MonthlySavingsFieldId.DATE]?.defaultValue
            );
            const selectedMonthsAsMap = getSelectedMonthsAsMap(
              monthlySavingsProfile
            );
            return (
              <Card key={portfolio.id} header={portfolio.name}>
                <div className="flex flex-col gap-y-2 p-3 text-sm">
                  <div className="flex justify-between">
                    <span>{t("wizards.monthlySavings.stepZero.amount")}</span>
                    <span
                      className="font-bold"
                      id={`monthlySavingsWizard-amountToSave-${portfolio.id}`}
                    >
                      {amount?.toLocaleString(i18n.language, {
                        style: "currency",
                        currency: portfolio.currency.securityCode,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t("wizards.monthlySavings.stepZero.account")}</span>
                    <span
                      className="font-bold"
                      id={`monthlySavingsWizard-account-${portfolio.id}`}
                    >
                      {debitAccount ? (
                        debitAccount?.number
                      ) : (
                        <NoAccountWarning
                          id={`monthlySavingsWizard-noAccountWarning-${portfolio.id}`}
                        />
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      {t("wizards.monthlySavings.stepZero.paymentDate")}
                    </span>
                    {!!date && (
                      <span
                        className="font-bold"
                        id={`monthlySavingsWizard-paymentDate-${portfolio.id}`}
                      >
                        {t(
                          "wizards.monthlySavings.stepZero.selectedPaymentDate",
                          {
                            date: numbro(Number(date)).format("0o"),
                          }
                        )}
                      </span>
                    )}
                  </div>
                  <hr className="border-1" />
                  <p>
                    {t(
                      "wizards.monthlySavings.stepThree.monthsSelectedGridTitle"
                    )}
                  </p>
                  <SelectMonthsGrid
                    id={`monthlySavingsWizard-selectedMonthsGrid-${portfolio.id}`}
                    disabled
                    selected={selectedMonthsAsMap}
                    narrow
                  />
                  <hr className="border-1" />
                  <div className="flex justify-between">
                    <Button
                      id={`monthlySavingsWizard-deletePlanButton-${portfolio.id}`}
                      disabled={!canPortfolioMonthlySave(portfolio)}
                      variant="Delete"
                      onClick={() => {
                        setTargetPortfolio(portfolio);
                        setConfirmDialogOpen(true);
                      }}
                    >
                      {t(
                        "wizards.monthlySavings.stepZero.deletePlanButtonLabel"
                      )}
                    </Button>
                    <Button
                      disabled={!canPortfolioMonthlySave(portfolio)}
                      onClick={() => editMonthlySavingsProfile(portfolio)}
                      id={`monthlySavingsWizard-editPlanButton-${portfolio.id}`}
                      variant="Secondary"
                    >
                      {t("wizards.monthlySavings.stepZero.editPlanButtonLabel")}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
          <ConfirmDialog
            id="monthlySavingsWizard-deletePlanDialog"
            title={t("wizards.monthlySavings.stepZero.deleteDialogTitle")}
            description={t(
              "wizards.monthlySavings.stepZero.deleteDialogDescription"
            )}
            confirmButtonText={t(
              "wizards.monthlySavings.stepZero.deleteDialogConfirmButtonLabel"
            )}
            cancelButtonText={t(
              "wizards.monthlySavings.stepZero.deleteDialogCancelButtonLabel"
            )}
            onConfirm={async () => await deleteMonthlySavingsProfile()}
            isOpen={confirmDialogOpen}
            setIsOpen={setConfirmDialogOpen}
            loading={loadingDelete}
            confirmButtonVariant="Red"
            disabled={!canSave}
          />
        </div>
        <WizardBottomNavigationReplica>
          {allowCreateNew && <AddNewPlanButton />}
        </WizardBottomNavigationReplica>
      </>
    );
  } else {
    return (
      <div className="flex w-full h-full">
        <div className="m-auto max-w-sm">
          <Badge severity={Severity.Info}>
            <p
              className="p-4 m-auto text-lg font-normal"
              id="monthlySavingsWizard-noPlansInfo"
            >
              {t("wizards.monthlySavings.stepZero.noPlansLabel")}
            </p>
          </Badge>
        </div>
        <WizardBottomNavigationReplica>
          <AddNewPlanButton />
        </WizardBottomNavigationReplica>
      </div>
    );
  }
};

export default MsStepZero;
