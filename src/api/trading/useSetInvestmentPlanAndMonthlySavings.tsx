import { useState } from "react";
import { FetchResult, gql, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { useModifiedTranslation } from "../../hooks/useModifiedTranslation";

/**
 * Representing FA Back Portfolio Investment plan.
 */
export interface InvestmentPlan {
  date: Date;
  securities: {
    securityCode: string;
    share: number;
    minShare?: number;
    maxShare?: number;
  }[];
}

/**
 * Converts an InvestmentPlan into an FA Back p.investmentPlan string.
 * https://documentation.fasolutions.com/en/file-formats-for-importing-contacts-and-portfolios.html#fa-format-for-importing-portfolios.
 * Does not support min and max share, only share.
 * @param investmentPlan the investment plan to convert into import string.
 * @returns An FA Back p.investmentPlan import format string (not including min/max share).
 */
export const investmentPlanToImportString = (
  investmentPlan: InvestmentPlan
) => {
  const date = investmentPlan.date;
  const securities = investmentPlan.securities;
  return securities.reduce((prev: string, curr) => {
    prev = `${prev},${curr.securityCode}=${curr.share}`;
    return prev;
  }, `${date.toLocaleDateString("sv-SE")}`);
};

/**
 * Ids (attribute keys) of relevant fields in the monthly savings profile.
 */
enum MonthlySavingsProfileKeys {
  DATE = "portfolio.monthlysavings.date",
  ENABLED = "portfolio.monthlysavings.enable",
  USE_INVESTMENT_PLAN = "portfolio.monthlysavings.useInvestmentPlan",
  AMOUNT = "portfolio.monthlysavings.amount",
  /** Example: December is MONTH_BASE.12, as in portfolio.monthlysavings.12 */
  MONTH_BASE = "portfolio.monthlysavings",
}

/**
 * Representing FA Back Portfolio Monthly savings profile.
 */
export interface MonthlySavingsProfile {
  date: number;
  enabled: boolean;
  useInvestmentPlan: boolean;
  selectedMonths: Record<number, boolean>;
  amount: number;
}

/**
 * Converts a MonthlySavingsProfile into an FA Back p.profileAttribute string.
 * https://documentation.fasolutions.com/en/file-formats-for-importing-contacts-and-portfolios.html#fa-format-for-importing-portfolios.
 * @param monthlySavingsProfile the monthly savings profile to convert into import string.
 * @returns An FA Back p.profileAttribute import format string.
 */
export const monthlySavingsProfileToImportString = (
  monthlySavingsProfile: MonthlySavingsProfile
) => {
  const selectedMonths = Object.entries(
    monthlySavingsProfile.selectedMonths
  ).reduce((prev: string, [key, value]) => {
    prev = `${prev}#${MonthlySavingsProfileKeys.MONTH_BASE}.${
      Number(key) + 1
    }=${value}:Boolean`;
    return prev;
  }, "");

  return `${MonthlySavingsProfileKeys.DATE}=${monthlySavingsProfile.date}:Integer#${MonthlySavingsProfileKeys.AMOUNT}=${monthlySavingsProfile.amount}:Double#${MonthlySavingsProfileKeys.ENABLED}=${monthlySavingsProfile.enabled}:Boolean#${MonthlySavingsProfileKeys.USE_INVESTMENT_PLAN}=${monthlySavingsProfile.useInvestmentPlan}:Boolean${selectedMonths}`;
};

interface SetInvestmentPlanAndMonthlySavingsMutationVariables {
  /** A string of key value pairs check p.investmentPlan:
   * https://documentation.fasolutions.com/en/file-formats-for-importing-contacts-and-portfolios.html.
   */
  investmentPlan: string;
  shortName: string;
  /** A string of key value pairs check p.profileAttributes:
   * https://documentation.fasolutions.com/en/file-formats-for-importing-contacts-and-portfolios.html.
   */
  monthlySavingsProfile: string;
}

const errorStatus = "ERROR" as const;

interface SetInvestmentPlanAndMonthlySavingsMutationResponse {
  importPortfolios: ({
    importStatus: "OK" | typeof errorStatus;
  } & unknown)[];
}

const SET_INVESTMENT_PLAN_AND_MONTHLY_SAVINGS_MUTATION = gql`
  mutation setInvestmentPlanAndMonthlySavings(
    $shortName: String
    $investmentPlan: String
    $monthlySavingsProfile: String
  ) {
    importPortfolios(
      portfolioList: [
        {
          shortName: $shortName
          investmentPlan: $investmentPlan
          profileAttributes: $monthlySavingsProfile
        }
      ]
    )
  }
`;

/**
 * Sets an investment plan + monthly savings
 * schedule to the target portfolio.
 */
export const useSetInvestmentPlanAndMonthlySavings = () => {
  const { t } = useModifiedTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [handleSetInvestmentPlanAndMonthlySavings] = useMutation<
    SetInvestmentPlanAndMonthlySavingsMutationResponse,
    SetInvestmentPlanAndMonthlySavingsMutationVariables
  >(SET_INVESTMENT_PLAN_AND_MONTHLY_SAVINGS_MUTATION);

  /**
   * Makes an api request to FA Back.
   * Mutates the target portfolio- adding/modifying investment plan
   * and monthly savings.
   */
  const setInvestmentPlanAndMonthlySavings = async (
    shortName: SetInvestmentPlanAndMonthlySavingsMutationVariables["shortName"],
    investmentPlan: InvestmentPlan,
    monthlySavingsProfile: MonthlySavingsProfile
  ) => {
    const investmentPlanAsImportString =
      investmentPlanToImportString(investmentPlan);
    const monthlySavingsProfileAsImportString =
      monthlySavingsProfileToImportString(monthlySavingsProfile);
    setSubmitting(true);
    try {
      const apiResponse = await handleSetInvestmentPlanAndMonthlySavings({
        variables: {
          shortName: shortName,
          investmentPlan: investmentPlanAsImportString,
          monthlySavingsProfile: monthlySavingsProfileAsImportString,
        },
      });

      handleBadAPIResponse(apiResponse);
      toast.success(t("Created new investment plan."), { autoClose: 3000 });
      setSubmitting(false);
      return apiResponse;
    } catch (e: unknown) {
      toast.error(t("Something went wrong."), {
        style: { whiteSpace: "pre-line" },
      });
      setSubmitting(false);
      return null;
    }
  };

  return { setInvestmentPlanAndMonthlySavings, submitting };
};

const handleBadAPIResponse = (
  apiResponse: FetchResult<
    SetInvestmentPlanAndMonthlySavingsMutationResponse,
    Record<string, unknown>,
    Record<string, unknown>
  >
) => {
  if (!apiResponse.data || !apiResponse.data.importPortfolios?.[0]) {
    throw new Error("Empty response");
  }

  if (apiResponse.data.importPortfolios[0].importStatus === errorStatus) {
    let errorMessage = "Bad request: \n";
    Object.entries(apiResponse.data.importPortfolios[0]).forEach(
      ([key, value]) => {
        if (value.includes("ERROR") && key !== "importStatus") {
          errorMessage += `${key}: ${value}; \n`;
        }
      }
    );
    throw new Error(errorMessage);
  }
};
