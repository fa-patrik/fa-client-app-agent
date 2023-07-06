import { useState } from "react";
import { FetchResult, gql, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { useModifiedTranslation } from "../../hooks/useModifiedTranslation";

export const SUPPORTED_ROWS_MONTHLY_INVESTMENTS = 15;

/**
 * Representing a row in the FA Back Portfolio Investment plan profile.
 */
interface PortfolioMonthlyInvestmentDTO {
  security: string;
  amount: number;
  date: number;
  selectedMonths: number[];
}

/**
 * Representing the FA Back Portfolio Investment plan profile.
 */
export interface PortfolioMonthlyInvestmentsDTO {
    shortName: string;
    enableInPfCurrency: boolean;
    rows: PortfolioMonthlyInvestmentDTO[];
}

interface SetMonthlyInvestmentsMutationVariables {
  monthlyInvestmentsProfile: PortfolioMonthlyInvestmentsDTO;
}

const errorStatus = "ERROR" as const;

interface SetMonthlyInvestmentsMutationResponse {
  importPortfolios: ({
    importStatus: "OK" | typeof errorStatus;
  } & unknown)[];
}

const SET_MONTHLY_INVESTMENTS_MUTATION = gql`
  mutation setMonthlyInvestments($shortName:String, $monthlyInvestments: PortfolioMonthlyInvestmentsDTO)
 {
    importPortfolioMonthlyInvestments(monthlyInvestments: $monthlyInvestments)
}
`;

/**
 * Import monthly investments profile data.
 */
export const useSetMonthlyInvestments = (mode = "New") => {
  const { t } = useModifiedTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [handleSetInvestmentPlanAndMonthlySavings] = useMutation<
    SetMonthlyInvestmentsMutationResponse,
    SetMonthlyInvestmentsMutationVariables
  >(SET_MONTHLY_INVESTMENTS_MUTATION);

  const setMonthlyInvestments = async (
    monthlyInvestments: SetMonthlyInvestmentsMutationVariables["monthlyInvestmentsProfile"]
  ) => {
    setSubmitting(true);
    try {
      const apiResponse = await handleSetInvestmentPlanAndMonthlySavings({
        variables: {
          monthlyInvestmentsProfile: monthlyInvestments,
        },
      });

      handleBadAPIResponse(apiResponse);
      toast.success(
        t(
          mode === "Delete"
            ? "Deleted monthly investment"
            : "Created new monthly investment"
        ),
        { autoClose: 3000, closeButton: false,  position: "top-center" }
      );
      setSubmitting(false);
      return apiResponse;
    } catch (e: unknown) {
      toast.error(t("Something went wrong."), {
        style: { whiteSpace: "pre-line" },
        closeButton: false,
        autoClose: 3000,
        position: "top-center"
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
