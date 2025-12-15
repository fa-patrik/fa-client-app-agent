import { useEffect, useState } from "react";
import type { Portfolio } from "api/common/useGetContactInfo";
import {
  PortfolioGroups,
  RepresentativeTag,
} from "api/common/useGetContactInfo";
import type { PortfolioWithProfileAndFigures } from "api/common/useGetPortfoliosWithProfileAndFigures";
import { useGetPortfoliosWithProfileAndFigures } from "api/common/useGetPortfoliosWithProfileAndFigures";
import type { TradableSecurity } from "api/trading/useGetTradebleSecurities";
import { useGetTradebleSecurityLazy } from "api/trading/useGetTradebleSecurities";
import { useSetMonthlyInvestments } from "api/trading/useSetMonthlyInvestments";
import { ReactComponent as PlusIcon } from "assets/plus-circle.svg";
import {
  Badge,
  Button,
  Card,
  ErrorMessage,
  LoadingIndicator,
} from "components";
import { Severity } from "components/Alert/Alert";
import { ConfirmDialog } from "components/Dialog/ConfirmDialog";
import { useFilteredPortfolioSelect } from "components/TradingModals/useFilteredPortfolioSelect";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useKeycloak } from "providers/KeycloakProvider";
import { useWizard } from "providers/WizardProvider";
import { PermissionMode, useFeature } from "services/permissions/usePermission";
import { getNumberOfOptions } from "utils/faBackProfiles/common";
import type {
  MonthlyInvestments,
  PortfolioWithMonthlyInvestments,
} from "utils/faBackProfiles/monthlyInvestments";
import {
  MonthlyInvestmentsFieldId,
  addMonthlyInvestmentsToPortfolios,
  convertMonthlyInvestmentsProfileToWizardState,
  getEmptyApiInput,
  getUniqueSecurityCodes,
} from "utils/faBackProfiles/monthlyInvestments";
import { WizardBottomNavigationReplica } from "wizards/components/WizardBottomNavigationReplica";
import SecurityDistributionTable from "../StepFive/SecurityDistributionTable";
import type { MonthlyInvestmentsWizardState } from "../types";

/**
 * Initial step of the monthly savings wizard.
 * Displays existing monthly savings setup
 * and a button to add a new one.
 */
const StepZero = () => {
  const { access } = useKeycloak();
  const { wizardData, setWizardData } = useWizard<
    MonthlyInvestmentsWizardState | undefined
  >();
  const {
    data: portfolioData,
    refetch: refetchPortfolioData,
    loading: loadingPortfolioData,
    error: errorGettingPortfolioData,
    networkStatus,
  } = useGetPortfoliosWithProfileAndFigures(true);
  const { getTradableSecurity, error: errorGettingSecurity } =
    useGetTradebleSecurityLazy();

  const portfolios = portfolioData?.portfolios;

  const [securities, setSecurities] = useState<
    Record<TradableSecurity["securityCode"], TradableSecurity>
  >({});

  const [
    portfoliosWithMonthlyInvestments,
    setPortfoliosWithMonthlyInvestments,
  ] = useState<
    (PortfolioWithProfileAndFigures & MonthlyInvestments)[] | undefined
  >(undefined);

  const { t } = useModifiedTranslation();
  const { setMonthlyInvestments } = useSetMonthlyInvestments();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingSecurityData, setLoadingSecurities] = useState(false);
  const [targetPortfolio, setTargetPortfolio] = useState<Portfolio | undefined>(
    undefined
  );

  const deleteMonthlyInvestmentProfile = async () => {
    setLoadingDelete(true);

    //send mutation to FA Back
    if (targetPortfolio) {
      const emptyMonthlyInvestmentProfile = getEmptyApiInput(
        targetPortfolio.shortName
      );
      await setMonthlyInvestments(emptyMonthlyInvestmentProfile, "Delete");
      await refetchPortfolioData();
      setLoadingDelete(false);
      setConfirmDialogOpen(false);
    }
  };

  const editMonthlyInvestmentsProfile = (
    portfolio: PortfolioWithMonthlyInvestments
  ) => {
    const monthlyInvestmentsWizardState =
      convertMonthlyInvestmentsProfileToWizardState(portfolio, securities);
    setWizardData((prevState) => ({
      ...prevState,
      step: 1,
      backDisabled: false,
      data: monthlyInvestmentsWizardState
        ? {
            ...monthlyInvestmentsWizardState,
            isEditing: true,
          }
        : undefined,
    }));
  };

  useEffect(() => {
    if (portfolios) {
      const modifiedPortfolios = addMonthlyInvestmentsToPortfolios(portfolios);
      setPortfoliosWithMonthlyInvestments(modifiedPortfolios);
    }
  }, [portfolios]);

  useEffect(() => {
    if (!portfoliosWithMonthlyInvestments) {
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      setLoadingSecurities(true);
      const securityData = {} as Record<string, TradableSecurity>;
      const uniqueSecurityCodes = getUniqueSecurityCodes(
        portfoliosWithMonthlyInvestments
      );

      if (uniqueSecurityCodes && uniqueSecurityCodes.size > 0) {
        for (const code of Array.from(uniqueSecurityCodes)) {
          if (cancelled) break;

          const variables = {
            securityCode: code,
          };
          const response = await getTradableSecurity(variables);
          const security = response?.data?.securities?.[0];
          if (security) securityData[security.securityCode] = security;
        }
      }

      if (!cancelled) {
        setSecurities(securityData);
        setLoadingSecurities(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfoliosWithMonthlyInvestments]);

  //enable next
  useEffect(() => {
    setWizardData((prevState) => ({
      ...prevState,
      nextDisabled: false,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loading =
    (loadingSecurityData && !Object.keys(securities)?.length) ||
    (loadingPortfolioData && !portfolioData);

  const errorAndNoDataToShow =
    (errorGettingPortfolioData || errorGettingSecurity) &&
    !portfolioData &&
    !Object.keys(securities)?.length;

  const { canPfOption: canPfOptionMonthlyInvest, canPf: canPfMonthlyInvest } =
    useFeature(
      PortfolioGroups.MONTHLY_INVESTMENTS,
      RepresentativeTag.MONTHLY_INVESTMENTS,
      PermissionMode.ANY
    );

  const { portfolioOptions: portfolioOptionsThatCanMonthlyInvest } =
    useFilteredPortfolioSelect(canPfOptionMonthlyInvest);

  const allowCreateNew =
    getNumberOfOptions(portfolioOptionsThatCanMonthlyInvest) >
    (portfoliosWithMonthlyInvestments?.length ?? 0);

  const AddNewPlanButton = ({ disabled }: { disabled?: boolean }) => (
    <Button
      id="monthlyInvestmentsWizard-addnewPlanButton"
      isLoading={loadingPortfolioData}
      disabled={disabled || loadingPortfolioData}
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
      {loadingPortfolioData
        ? t("wizards.monthlyInvestments.stepZero.refreshingDataButtonLabel")
        : t("wizards.monthlyInvestments.stepZero.addNewPlanButtonLabel")}
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
  if (errorAndNoDataToShow) {
    return (
      <div className="p-4 m-auto w-full h-full">
        <ErrorMessage header={t("messages.noCachedDataInfo")}>
          {networkStatus === 4 ? (
            <LoadingIndicator center size="sm" />
          ) : (
            <Button
              id="monthlyInvestmentsWizard-refetchPortfolioDataButton"
              onClick={() => refetchPortfolioData()}
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
  }

  //at this point should have enough data to render something useful
  if (
    portfoliosWithMonthlyInvestments &&
    portfoliosWithMonthlyInvestments.length > 0
  ) {
    return (
      <>
        <div className="flex overflow-y-auto flex-col gap-y-4 p-4 m-auto w-full max-w-xl">
          {portfoliosWithMonthlyInvestments.map((portfolio, index) => {
            const monthlyInvestmentsProfile = portfolio.monthlyInvestments;
            const securitiesInProfile: TradableSecurity[] = [];
            const amountDistribution: MonthlyInvestmentsWizardState["amountDistribution"] =
              {};
            const securityIdToDate: Record<TradableSecurity["id"], number> = {};
            let totalAmount = 0;

            if (monthlyInvestmentsProfile) {
              //extract the portfolio specific data
              for (const [, fields] of Object.entries(
                monthlyInvestmentsProfile.rows
              )) {
                const amount =
                  fields?.[MonthlyInvestmentsFieldId.AMOUNT]?.doubleValue;
                const securityCode =
                  fields?.[MonthlyInvestmentsFieldId.SECURITY]?.stringValue;
                const date = fields?.[MonthlyInvestmentsFieldId.DATE]?.intValue;
                const security = securityCode
                  ? securities[securityCode]
                  : undefined;
                if (amount && date && security) {
                  securitiesInProfile.push(security);
                  amountDistribution[security?.id] = amount.toString();
                  totalAmount += amount;
                  if (date) securityIdToDate[security?.id] = date;
                }
              }
            }

            if (securitiesInProfile.length > 0) {
              const securitiesSortedByAmountDistribution =
                securitiesInProfile?.sort(
                  (secA: TradableSecurity, secB: TradableSecurity) => {
                    const numericalOrder =
                      (Number(amountDistribution?.[secB.id]) || 0) -
                      (Number(amountDistribution?.[secA.id]) || 0);
                    if (numericalOrder === 0) {
                      //equally large- sort by name
                      return secA.name
                        .toLowerCase()
                        .localeCompare(secB.name.toLowerCase());
                    } else {
                      return numericalOrder;
                    }
                  }
                );
              return (
                <Card key={portfolio.id} header={portfolio.name}>
                  <div className="flex flex-col gap-y-2 p-3">
                    <div className="flex justify-between">
                      <span>
                        {t("wizards.monthlyInvestments.stepZero.amount")}
                      </span>
                      <span
                        className="font-bold"
                        id={`monthlyInvestmentsWizard-amountToInvest-${index}`}
                      >
                        {t("numberWithCurrency", {
                          value: totalAmount,
                          currency: portfolio.currency.securityCode,
                        })}
                      </span>
                    </div>
                    <hr className="border" />
                    <div className="overflow-x-auto w-full">
                      <SecurityDistributionTable
                        id={`monthlyInvestmentsWizard-securityDistributionTable-${index}`}
                        amountDistribution={amountDistribution}
                        totalAmount={totalAmount}
                        securities={securitiesSortedByAmountDistribution}
                        portfolioCurrencyCode={portfolio.currency.securityCode}
                      />
                    </div>
                    <hr className="border" />
                    <div className="flex justify-between">
                      <Button
                        id={`monthlyInvestmentsWizard-deletePlanButton-${index}`}
                        disabled={!canPfMonthlyInvest(portfolio)}
                        variant="Delete"
                        onClick={() => {
                          setTargetPortfolio(portfolio);
                          setConfirmDialogOpen(true);
                        }}
                      >
                        {t(
                          "wizards.monthlyInvestments.stepZero.deletePlanButtonLabel"
                        )}
                      </Button>
                      <Button
                        disabled={!canPfMonthlyInvest(portfolio)}
                        onClick={() => editMonthlyInvestmentsProfile(portfolio)}
                        id={`monthlyInvestmentsWizard-editPlanButton-${index}`}
                        variant="Secondary"
                      >
                        {t(
                          "wizards.monthlyInvestments.stepZero.editPlanButtonLabel"
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            }
            //portfolio did not have any monthly investment profile entries
            return null;
          })}

          <ConfirmDialog
            id="monthlyInvestmentsWizard-deletePlanDialog"
            title={t("wizards.monthlyInvestments.stepZero.deleteDialogTitle")}
            description={t(
              "wizards.monthlyInvestments.stepZero.deleteDialogDescription"
            )}
            confirmButtonText={t(
              "wizards.monthlyInvestments.stepZero.deleteDialogConfirmButtonLabel"
            )}
            cancelButtonText={t(
              "wizards.monthlyInvestments.stepZero.deleteDialogCancelButtonLabel"
            )}
            onConfirm={async () => await deleteMonthlyInvestmentProfile()}
            isOpen={confirmDialogOpen}
            setIsOpen={setConfirmDialogOpen}
            loading={loadingDelete}
            confirmButtonVariant="Red"
            disabled={!access.buy}
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
        <div className="m-auto max-w-xs">
          <Badge severity={Severity.Info}>
            <p
              className="p-4 m-auto text-lg font-normal"
              id="monthlyInvestmentsWizard-noPlansLabel"
            >
              {t("wizards.monthlyInvestments.stepZero.noPlansLabel")}
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

export default StepZero;
