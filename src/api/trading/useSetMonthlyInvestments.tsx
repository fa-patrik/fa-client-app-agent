import { useState } from "react";
import { FetchResult, gql, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { useModifiedTranslation } from "../../hooks/useModifiedTranslation";

const MONTHLY_INVESTMENT_PROFILE_KEY = "portfolio.monthlyinvestments";
export const SUPPORTED_ROWS_MONTHLY_INVESTMENTS = 15;

enum FaBackProfileDataTypes {
  DOUBLE = "Double",
  INTEGER = "Integer",
  BOOLEAN = "Boolean",
  DATE = "Date",
  STRING = "String",
}

/**
 * Representing a row in the FA Back Portfolio Investment plan profile.
 */
interface MonthlyInvestmentRow {
  security: string;
  amount: number;
  date: number;
  selectedMonths: Record<string, boolean>;
}

/**
 * Representing the FA Back Portfolio Investment plan profile.
 */
export interface MonthlyInvestmentsProfile {
  enableInPfCurrency: boolean;
  rows: MonthlyInvestmentRow[];
}

/**
 * The ids (attribute keys) of a row in FA Back Portfolio Monthly investments profile.
 * For example, portfolio.monthlyinvestments.5.security. 5 refers to an arbitrary row number.
 */
enum MonthlyInvestmentsKeys {
  ENABLE_IN_PF_CURRENCY = "enable",
  SECURITY = "security",
  AMOUNT = "amount",
  DATE = "date",
  JAN = "1",
  FEB = "2",
  MAR = "3",
  APR = "4",
  MAY = "5",
  JUN = "6",
  JUL = "7",
  AUG = "8",
  OCT = "9",
  NOV = "10",
  DEC = "12",
}

/**
 * Converts a MonthlyInvestmentsProfile into an FA Back p.profileAttribute string.
 * https://documentation.fasolutions.com/en/file-formats-for-importing-contacts-and-portfolios.html#fa-format-for-importing-portfolios.
 * @param monthlyInvestmentsProfile the monthly savings profile to convert into import string.
 * @returns An FA Back p.profileAttribute import format string.
 */
export const monthlyInvestmentsProfileToImportString = (
  monthlyInvestmentsProfile: MonthlyInvestmentsProfile
) => {
  const rows = monthlyInvestmentsProfile.rows.reduce(
    (prev: string, row, index) => {
      const rowNr = index + 1;
      prev = `${prev}#${MONTHLY_INVESTMENT_PROFILE_KEY}.${rowNr}.${MonthlyInvestmentsKeys.DATE}=${row.date}:${FaBackProfileDataTypes.INTEGER}`;
      prev = `${prev}#${MONTHLY_INVESTMENT_PROFILE_KEY}.${rowNr}.${MonthlyInvestmentsKeys.SECURITY}=${row.security}:${FaBackProfileDataTypes.STRING}`;
      prev = `${prev}#${MONTHLY_INVESTMENT_PROFILE_KEY}.${rowNr}.${MonthlyInvestmentsKeys.AMOUNT}=${row.amount}:${FaBackProfileDataTypes.DOUBLE}`;
      Object.entries(row.selectedMonths).forEach(([month, selected]) => {
        prev = `${prev}#${MONTHLY_INVESTMENT_PROFILE_KEY}.${rowNr}.${
          Number(month) + 1
        }=${selected}:${FaBackProfileDataTypes.BOOLEAN}`;
      });
      return prev;
    },
    ""
  );
  return `${MONTHLY_INVESTMENT_PROFILE_KEY}.${MonthlyInvestmentsKeys.ENABLE_IN_PF_CURRENCY}=${monthlyInvestmentsProfile.enableInPfCurrency}:${FaBackProfileDataTypes.BOOLEAN}${rows}`;
};

interface SetMonthlyInvestmentsMutationVariables {
  shortName: string;
  /** A string of key value pairs check p.profileAttributes:
   * https://documentation.fasolutions.com/en/file-formats-for-importing-contacts-and-portfolios.html.
   */
  monthlyInvestmentsProfile: string;
}

const errorStatus = "ERROR" as const;

interface SetMonthlyInvestmentsMutationResponse {
  importPortfolios: ({
    importStatus: "OK" | typeof errorStatus;
  } & unknown)[];
}

const SET_MONTHLY_INVESTMENTS_MUTATION = gql`
  mutation setMonthlyInvestments(
    $shortName: String
    $monthlyInvestmentsProfile: String
  ) {
    importPortfolios(
      portfolioList: [
        { shortName: $shortName, profileAttributes: $monthlyInvestmentsProfile }
      ]
    )
  }
`;

/**
 * Sets monthly investments profile data to the target portfolio.
 */
export const useSetMonthlyInvestments = (mode = "New") => {
  const { t } = useModifiedTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [handleSetInvestmentPlanAndMonthlySavings] = useMutation<
    SetMonthlyInvestmentsMutationResponse,
    SetMonthlyInvestmentsMutationVariables
  >(SET_MONTHLY_INVESTMENTS_MUTATION);

  /**
   * Makes an api request to FA Back.
   * Mutates the target portfolio- adding/modifying investment plan
   * and monthly savings.
   */
  const setMonthlyInvestments = async (
    shortName: SetMonthlyInvestmentsMutationVariables["shortName"],
    monthlyInvestmentsProfile: SetMonthlyInvestmentsMutationVariables["monthlyInvestmentsProfile"]
  ) => {
    setSubmitting(true);
    try {
      const apiResponse = await handleSetInvestmentPlanAndMonthlySavings({
        variables: {
          shortName: shortName,
          monthlyInvestmentsProfile: monthlyInvestmentsProfile,
        },
      });

      handleBadAPIResponse(apiResponse);
      toast.success(
        t(
          mode === "Delete"
            ? "Deleted monthly investment"
            : "Created new monthly investment"
        ),
        { autoClose: 3000, closeButton: false }
      );
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

  return { setMonthlyInvestments, submitting };
};

const handleBadAPIResponse = (
  apiResponse: FetchResult<
    SetMonthlyInvestmentsMutationResponse,
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
