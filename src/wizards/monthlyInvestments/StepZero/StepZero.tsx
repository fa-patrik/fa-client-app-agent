import { useEffect, useState } from "react";
import {
  PortfolioWithProfileAndFigures,
  useGetPortfoliosWithProfileAndFigures,
} from "api/generic/useGetPortfoliosWithProfileAndFigures";
import { Portfolio } from "api/initial/useGetContactInfo";
import {
  TradableSecurity,
  useGetTradebleSecurityLazy,
} from "api/trading/useGetTradebleSecurities";
import {
  PortfolioMonthlyInvestmentsDTOInput,
  useSetMonthlyInvestments,
} from "api/trading/useSetMonthlyInvestments";
import { ReactComponent as PlusIcon } from "assets/plus-circle.svg";
import {
  Badge,
  Button,
  Card,
  ErrorMessage,
  LoadingIndicator,
} from "components";
import { ConfirmDialog } from "components/Dialog/ConfirmDialog";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useKeycloak } from "providers/KeycloakProvider";
import { useWizard } from "providers/WizardProvider";
import {
  MonthlyInvestments,
  MonthlyInvestmentsFieldId,
  addMonthlyInvestmentsToPortfolios,
  getUniqueSecurityCodes,
} from "utils/faBackProfiles/monthlyInvestments";
import { WizardBottomNavigationReplica } from "wizards/components/WizardBottomNavigationReplica";
import SecurityDistributionTable from "../StepFive/SecurityDistributionTable";

/**
 * Initial step of the monthly savings wizard.
 * Displays existing monthly savings setup
 * and a button to add a new one.
 */
const StepZero = () => {
  const [isMounted, setIsMounted] = useState(true);
  const { impersonating } = useKeycloak();
  const { setWizardData } = useWizard();
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

  const { t, i18n } = useModifiedTranslation();
  const { setMonthlyInvestments } = useSetMonthlyInvestments("Delete");
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
      const emptyMonthlyInvestmentProfile: PortfolioMonthlyInvestmentsDTOInput =
        {
          enableInPfCurrency: false,
          portfolio: targetPortfolio?.shortName,
          rows: [],
        };

      await setMonthlyInvestments(emptyMonthlyInvestmentProfile);
      await refetchPortfolioData();
      setLoadingDelete(false);
      setConfirmDialogOpen(false);
    }
  };

  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (portfolios) {
      const modifiedPortfolios = addMonthlyInvestmentsToPortfolios(portfolios);
      setPortfoliosWithMonthlyInvestments(() => modifiedPortfolios);
    }
  }, [portfolios]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingSecurities(true);
      const securityData = {} as Record<string, TradableSecurity>;
      const uniqueSecurityCodes =
        portfoliosWithMonthlyInvestments &&
        getUniqueSecurityCodes(portfoliosWithMonthlyInvestments);

      if (uniqueSecurityCodes) {
        for (const code of Array.from(uniqueSecurityCodes)) {
          const variables = {
            securityCode: code,
          };
          const response = await getTradableSecurity(variables);
          const security = response?.data?.securities?.[0];
          if (security) securityData[security.securityCode] = security;
        }
      }

      setSecurities(() => securityData);
      setLoadingSecurities(false);
    };

    if (isMounted) fetchData();
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
    loadingSecurityData || (loadingPortfolioData && !portfolioData);

  const errorAndNoDataToShow =
    (errorGettingPortfolioData || errorGettingSecurity) &&
    !portfolioData &&
    !Object.keys(securities)?.length;

  const AddNewPlanButton = () => (
    <Button
      isLoading={loadingPortfolioData}
      disabled={loadingPortfolioData}
      LeftIcon={PlusIcon}
      onClick={() =>
        setWizardData((prevState) => ({
          ...prevState,
          step: 1,
          backDisabled: false,
        }))
      }
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
          {portfoliosWithMonthlyInvestments.map((portfolio) => {
            const monthlyInvestmentsProfile = portfolio.monthlyInvestments;
            const securitiesInProfile: TradableSecurity[] = [];
            const amountDistribution: Record<TradableSecurity["id"], number> =
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
                  amountDistribution[security?.id] = amount;
                  totalAmount += amount;
                  if (date) securityIdToDate[security?.id] = date;
                }
              }
            }

            if (securitiesInProfile.length > 0)
              return (
                <Card key={portfolio.id} header={portfolio.name}>
                  <div className="flex flex-col gap-y-2 p-3">
                    <div className="flex justify-between">
                      <span>
                        {t("wizards.monthlyInvestments.stepZero.amount")}
                      </span>
                      <span className="font-bold">
                        {totalAmount.toLocaleString(i18n.language, {
                          style: "currency",
                          currency: portfolio.currency.securityCode,
                        })}
                      </span>
                    </div>
                    <hr className="border-1" />
                    <div className="overflow-x-auto w-full">
                      <SecurityDistributionTable
                        id={`securityDistributionTable-${portfolio.id}`}
                        amountDistribution={amountDistribution}
                        totalAmount={totalAmount}
                        securities={securitiesInProfile}
                        portfolioCurrencyCode={portfolio.currency.securityCode}
                      />
                    </div>
                    <hr className="border-1" />
                    <div className="flex justify-between p-3">
                      <Button
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
                      {false && ( //to be implemented
                        <Button variant="Secondary">Edit</Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            //portfolio did not have any monthly investment profile entries
            return null;
          })}

          <ConfirmDialog
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
            disabled={impersonating}
          />
        </div>
        <WizardBottomNavigationReplica>
          <AddNewPlanButton />
        </WizardBottomNavigationReplica>
      </>
    );
  } else {
    return (
      <div className="flex w-full h-full">
        <div className="m-auto max-w-xs">
          <Badge colorScheme="blue">
            <p className="p-4 m-auto text-lg font-normal">
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
