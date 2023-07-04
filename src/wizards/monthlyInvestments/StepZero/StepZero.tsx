import { useEffect, useMemo, useState } from "react";
import {
  Attribute,
  Portfolio,
  useGetContactInfo,
} from "api/initial/useGetContactInfo";
import {
  TradableSecurity,
  useGetTradebleSecurityLazy,
} from "api/trading/useGetTradebleSecurities";
import {
  MonthlyInvestmentsProfile,
  monthlyInvestmentsProfileToImportString,
  SUPPORTED_ROWS_MONTHLY_INVESTMENTS,
  useSetMonthlyInvestments,
} from "api/trading/useSetMonthlyInvestments";
import { ReactComponent as PlusIcon } from "assets/plus-circle.svg";
import classNames from "classnames";
import { Badge, Button, Card, LoadingIndicator } from "components";
import { ConfirmDialog } from "components/Dialog/ConfirmDialog";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useKeycloak } from "providers/KeycloakProvider";
import { useWizard } from "providers/WizardProvider";
import SecurityDistributionTable from "../StepFive/SecurityDistributionTable";

const months = Array(12)
  .fill(undefined)
  .map((_, idx) => {
    return idx;
  });

const createEmptyMonthlyInvestmentPlan = () => {
  const rowsInProfile = new Array(SUPPORTED_ROWS_MONTHLY_INVESTMENTS).fill(
    undefined
  );

  const emptyMonthlyInvestmentProfile: MonthlyInvestmentsProfile =
    rowsInProfile?.reduce(
      (prev, curr: undefined) => {
        //reset rows in the profile
        prev.rows.push({
          date: 0,
          selectedMonths: months.reduce((prev, curr) => {
            prev[curr] = false;
            return prev;
          }, {} as Record<string, boolean>),
          security: "",
          amount: 0,
        });
        return prev;
      },
      {
        enableInPfCurrency: false,
        rows: [],
      } as MonthlyInvestmentsProfile
    );

  return emptyMonthlyInvestmentProfile;
};

/**
 * Returns a map of the monthly investments from a list of portfolios.
 * @todo Have it return Record<Portfolio["id"], MonthlyInvestmentsProfile> instead.
 * @param portfolios
 * @returns A map looking like this: [pfId: [rowNr: [attributeKey: Attribute]]]
 */
const getMonthlyInvestmentDataMap = (portfolios: Portfolio[] | undefined) => {
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
    const subPortfolioMonthlyInvestmentDataMap = getMonthlyInvestmentDataMap(
      curr.portfolios
    );
    prev = { ...prev, ...subPortfolioMonthlyInvestmentDataMap };
    return prev;
  }, {} as Record<string, Record<string, Record<string, Attribute>>>);
};

const MONTHLY_INVESTMENT_PROFILE_KEY = "monthlyinvestments";

enum MonthlyInvestmentsKeys {
  SECURITY = "security",
  AMOUNT = "amount",
  DATE = "date",
}

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
    data: contactData,
    refetch: refetchContactInfo,
    loading: loadingContactData,
  } = useGetContactInfo();
  const { getTradableSecurity } = useGetTradebleSecurityLazy();
  const [securities, setSecurities] = useState<
    Record<TradableSecurity["securityCode"], TradableSecurity>
  >({});

  const portfoliosMonthlyInvestmentsDataMap = useMemo(
    () => getMonthlyInvestmentDataMap(contactData?.portfolios),
    [contactData]
  );

  const { i18n } = useModifiedTranslation();
  const { setMonthlyInvestments } = useSetMonthlyInvestments("Delete");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingSecurityData, setLoadingSecurities] = useState(false);
  const [targetPortfolio, setTargetPortfolio] = useState<Portfolio | undefined>(
    undefined
  );

  /**
   * Loops through all portfolio monthly investment profiles to find if at least
   * one has a row with a security code defined.
   */
  const hasMonthlyInvestments = useMemo(() => {
    const portfolioRows =
      portfoliosMonthlyInvestmentsDataMap &&
      Object.values(portfoliosMonthlyInvestmentsDataMap);
    return portfolioRows?.some((rows) => {
      const attributes = rows && Object.values(rows);
      return attributes?.some((attribute) => {
        return attribute[MonthlyInvestmentsKeys.SECURITY]?.stringValue;
      });
    });
  }, [portfoliosMonthlyInvestmentsDataMap]);

  useEffect(() => {
    return () => setIsMounted(false);
  });

  useEffect(() => {
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
        const security = response.data?.securities?.[0];
        if (security) securityData[security.securityCode] = security;
      }
      setSecurities(() => securityData);
      setLoadingSecurities(false);
    };
    if (isMounted) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactData]);

  const deleteMonthlyInvestmentProfile = async () => {
    setLoadingDelete(true);
    const monthlyInvestmentProfile: MonthlyInvestmentsProfile =
      createEmptyMonthlyInvestmentPlan();

    const monthlyInvestmentProfileAsImportString =
      monthlyInvestmentsProfileToImportString(monthlyInvestmentProfile);
    //send mutation to FA Back
    if (targetPortfolio && monthlyInvestmentProfileAsImportString) {
      await setMonthlyInvestments(
        targetPortfolio.shortName,
        monthlyInvestmentProfileAsImportString
      );
      await refetchContactInfo();
      //close the open dialog
      setLoadingDelete(false);
      setConfirmDialogOpen(false);
    }
  };

  //enable next
  useEffect(() => {
    setWizardData((prevState) => ({
      ...prevState,
      nextDisabled: false,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loadingSecurityData || loadingContactData)
    return <LoadingIndicator center />;

  const AddNewPlanButton = () => (
    <Button
      LeftIcon={PlusIcon}
      onClick={() =>
        setWizardData((prevState) => ({
          ...prevState,
          step: 1,
          backDisabled: false,
        }))
      }
    >
      Add new plan
    </Button>
  );

  return (
    <div
      className={classNames("flex flex-col gap-y-3 ", {
        "justify-center items-center h-full": !hasMonthlyInvestments,
      })}
    >
      {!hasMonthlyInvestments && (
        <div className="max-w-sm">
          <Badge colorScheme="blue">
            <div className="p-4 text-lg">
              You do not have any monthly investments plans
            </div>
          </Badge>
        </div>
      )}
      {contactData?.portfolios?.map((portfolio) => {
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
                  <span>Amount</span>
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
                    Delete
                  </Button>
                  {false && ( //to be implemented
                    <Button variant="Secondary">Edit</Button>
                  )}
                </div>
              </div>
            </Card>
          );
        //portfolio did not have any monthly investment profile entries
        //or the security api requests failed
        return null;
      })}
      <div>
        <AddNewPlanButton />
      </div>
      <ConfirmDialog
        title="Delete monthly investment plan?"
        description={`This will delete the plan.`}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
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
