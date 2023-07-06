import { useEffect, useState } from "react";
import { Attribute, PortfolioWithProfileAndFigures, useGetPortfoliosWithProfileAndFigures } from "api/generic/useGetPortfoliosWithProfileAndFigures";
import { Portfolio } from "api/initial/useGetContactInfo";
import {
  TradableSecurity,
  useGetTradebleSecurityLazy,
} from "api/trading/useGetTradebleSecurities";
import {
  PortfolioMonthlyInvestmentsDTO,
  useSetMonthlyInvestments,
} from "api/trading/useSetMonthlyInvestments";
import { ReactComponent as PlusIcon } from "assets/plus-circle.svg";
import { Badge, Button, Card, ErrorMessage, LoadingIndicator } from "components";
import { ConfirmDialog } from "components/Dialog/ConfirmDialog";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useKeycloak } from "providers/KeycloakProvider";
import { useWizard } from "providers/WizardProvider";
import SecurityDistributionTable from "../StepFive/SecurityDistributionTable";

/**
 * Returns a map of the monthly investments from a list of portfolios.
 * @todo Have it return Record<Portfolio["id"], MonthlyInvestmentsProfile> instead.
 * @param portfolios
 * @returns A map looking like this: [pfId: [rowNr: [attributeKey: Attribute]]]
 */
const getMonthlyInvestmentDataMap = (portfolios: PortfolioWithProfileAndFigures[] | undefined) => {
  if (!portfolios?.length) return {};
  return portfolios?.reduce((prev, curr) => {
    if (curr.profile) {
      prev[curr.id] = curr.profile.attributes.reduce((prev, curr) => {
        //split the attributeKey into its constituents
        //for example "portfolio.monthlyinvestements.5.security" =>
        //["portfolio","monthlyinvestments","5","security"]
        const [, profileKey, row, field] = curr.attributeKey.split(".");
        //add field to map
        if (profileKey?.toLowerCase() === MONTHLY_INVESTMENT_PROFILE_KEY) {
          if (!(row in prev)) prev[row] = {};
          prev[row][field] = curr;
        }
        return prev;
      }, {} as Record<string, Record<string, Attribute>>);
      prev = { ...prev };
    }

    prev = { ...prev};
    return prev;
  }, {} as Record<string, Record<string, Record<string, Attribute>>>);
};

const MONTHLY_INVESTMENT_PROFILE_KEY = "monthlyinvestments";

enum MonthlyInvestmentsKeys {
  SECURITY = "security",
  AMOUNT = "amount",
  DATE = "date",
}

const getHasMonthlyInvestmentPlan = (
  portfoliosMonthlyInvestmentsDataMap:
    | Record<string, Record<string, Record<string, Attribute>>>
    | undefined
) => {
  const portfolioRows =
    portfoliosMonthlyInvestmentsDataMap &&
    Object.values(portfoliosMonthlyInvestmentsDataMap);
  return (
    portfolioRows?.some((rows) => {
      const attributes = rows && Object.values(rows);
      return attributes?.some((attribute) => {
        //check if there is an amount
        return !!attribute[MonthlyInvestmentsKeys.AMOUNT]?.doubleValue;
      });
    }) || false
  );
};

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
    networkStatus
  } = useGetPortfoliosWithProfileAndFigures(true);
  const { getTradableSecurity, error: errorGettingSecurity } = useGetTradebleSecurityLazy();

  const portfolios = portfolioData?.portfolios;
  
  const [securities, setSecurities] = useState<
    Record<TradableSecurity["securityCode"], TradableSecurity>
  >({});
  const [
    portfoliosMonthlyInvestmentsDataMap,
    setPortfoliosMonthlyInvestmentsDataMap,
  ] = useState<Record<string, Record<string, Record<string, Attribute>>>>( () =>
    getMonthlyInvestmentDataMap(portfolios)
  );

  const [hasMonthlyInvestments, setHasMonthlyInvestments] = useState( () => 
    getHasMonthlyInvestmentPlan(portfoliosMonthlyInvestmentsDataMap)
  );

  const { t,i18n } = useModifiedTranslation();
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
      const emptyMonthlyInvestmentProfile: PortfolioMonthlyInvestmentsDTO = {
        enableInPfCurrency: false,
        shortName: targetPortfolio?.shortName,
        rows: []
      }

      await setMonthlyInvestments(
        emptyMonthlyInvestmentProfile
      );
      setLoadingDelete(false);
      setConfirmDialogOpen(false);
      await refetchPortfolioData();
    }
  };

  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    setPortfoliosMonthlyInvestmentsDataMap(() => getMonthlyInvestmentDataMap(portfolios));
  }, [portfolios]);

  useEffect(() => {
    setHasMonthlyInvestments( () =>
      getHasMonthlyInvestmentPlan(portfoliosMonthlyInvestmentsDataMap)
    );

    const fetchData = async () => {
      setLoadingSecurities(true);
      const securityData = {} as Record<string, TradableSecurity>;
      const rows = Object.values(portfoliosMonthlyInvestmentsDataMap);
      const uniqueSecurityCodes = rows.reduce(
        (accumulatedCodes: Set<string>, row) => {
          const fields = Object.values(row);
          return fields.reduce((codesInRow: Set<string>, field) => {
            return Object.entries(field).reduce(
              (codesInField: Set<string>, [fieldName, attribute]) => {
                if (
                  fieldName?.toLowerCase() ===
                    MonthlyInvestmentsKeys.SECURITY &&
                  attribute.stringValue
                ) {
                  codesInField.add(attribute.stringValue);
                }
                return codesInField;
              },
              codesInRow
            );
          }, accumulatedCodes);
        },
        new Set<string>()
      );

      for (const code of Array.from(uniqueSecurityCodes)) {
        const variables = {
          securityCode: code,
        };
        const response = await getTradableSecurity(variables);
        const security = response?.data?.securities?.[0];
        if (security) securityData[security.securityCode] = security;
      }
      setSecurities(() => securityData);
      setLoadingSecurities(false);
    };

    if (isMounted) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfoliosMonthlyInvestmentsDataMap]);


  //enable next
  useEffect(() => {
    setWizardData((prevState) => ({
      ...prevState,
      nextDisabled: false,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loading = loadingSecurityData ||
  (loadingPortfolioData && !portfolioData) ||
  (!hasMonthlyInvestments && loadingPortfolioData)

  const errorAndNoDataToShow =  (errorGettingPortfolioData || errorGettingSecurity) && !portfolioData && !Object.keys(securities)?.length

  const AddNewPlanButton = () => (
    <div className="absolute right-5 bottom-5">
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
          {loadingPortfolioData ? t("wizards.monthlyInvestments.stepZero.refreshingDataButtonLabel") : t("wizards.monthlyInvestments.stepZero.addNewPlanButtonLabel")}
        </Button>
      </div>
  )

  //loading
  if (loading)
    return <LoadingIndicator center />;

  //error and no data to display
  if(errorAndNoDataToShow){
    return (<ErrorMessage header={t("messages.noCachedDataInfo")}>
    {networkStatus === 4 ? (
      <LoadingIndicator center size="sm" />
    ): 
    <Button onClick={() => refetchPortfolioData()} variant="Transparent">
    <span  className="text-primary-500 underline">{t("wizards.monthlyInvestments.stepOne.refetchDataButtonLabel")}</span>
    </Button>
    }
  </ErrorMessage>)
  }

  if(!hasMonthlyInvestments) return(
    <div
      className="flex flex-col justify-center items-center h-full"
    >
      <div className="max-w-sm">
        <Badge colorScheme="blue">
          <div className="p-4 text-lg">
            {t("wizards.monthlyInvestments.stepZero.noPlansLabel")}
          </div>
        </Badge>
      </div>
      <AddNewPlanButton/>
    </div>
  )
    
  //at this point should have enough data to render something useful
  return (
    <div
      className="flex flex-col gap-y-3 "
    >
      {portfolios?.map((portfolio) => {
        const monthlyInvestmentsDataMap =
          portfoliosMonthlyInvestmentsDataMap?.[portfolio.id];
        const securitiesInProfile: TradableSecurity[] = [];
        const amountDistribution: Record<TradableSecurity["id"], number> = {};
        const securityIdToDate: Record<TradableSecurity["id"], number> = {};
        let totalAmount = 0;

        if (monthlyInvestmentsDataMap) {
          //extract the portfolio specific data
          for (const [, fields] of Object.entries(monthlyInvestmentsDataMap)) {
            const amount = fields?.[MonthlyInvestmentsKeys.AMOUNT]?.doubleValue;
            const securityCode =
              fields?.[MonthlyInvestmentsKeys.SECURITY]?.stringValue;
            const date = fields?.[MonthlyInvestmentsKeys.DATE]?.intValue;
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
                  <span>{t("wizards.monthlyInvestments.stepZero.amount")}</span>
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
                    {t("wizards.monthlyInvestments.stepZero.deletePlanButtonLabel")}
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
      <AddNewPlanButton/>
      <ConfirmDialog
        title={t("wizards.monthlyInvestments.stepZero.deleteDialogTitle")}
        description={t("wizards.monthlyInvestments.stepZero.deleteDialogDescription")}
        confirmButtonText={t("wizards.monthlyInvestments.stepZero.deleteDialogConfirmButtonLabel")}
        cancelButtonText={t("wizards.monthlyInvestments.stepZero.deleteDialogCancelButtonLabel")}
        onConfirm={async () => await deleteMonthlyInvestmentProfile()}
        isOpen={confirmDialogOpen}
        setIsOpen={setConfirmDialogOpen}
        loading={loadingDelete}
        confirmButtonVariant="Red"
        disabled={impersonating}
      />
    </div>
  );
};

export default StepZero;
