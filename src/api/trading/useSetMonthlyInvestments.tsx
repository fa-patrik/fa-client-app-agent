import { useState } from "react";
import { FetchResult, gql, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { useModifiedTranslation } from "../../hooks/useModifiedTranslation";

export const SUPPORTED_ROWS_MONTHLY_INVESTMENTS = 15;
type mode = "Delete" | "New"

/**
 * Representing a row in the FA Back Portfolio Investment plan profile.
 */
interface PortfolioMonthlyInvestmentDTOInput {
  security: string;
  amount: number;
  date: number;
  selectedMonths: number[];
}

/**
 * Representing the FA Back Portfolio Investment plan profile.
 */
export interface PortfolioMonthlyInvestmentsDTOInput {
    portfolio: string;
    enableInPfCurrency: boolean;
    rows: PortfolioMonthlyInvestmentDTOInput[];
}

interface SetMonthlyInvestmentsMutationVariables {
  monthlyInvestments: PortfolioMonthlyInvestmentsDTOInput;
}

interface SetMonthlyInvestmentsMutationResponse {
  importPortfolioMonthlyInvestments: PortfolioMonthlyInvestmentsDTOInput
}

const SET_MONTHLY_INVESTMENTS_MUTATION = gql`
  mutation setMonthlyInvestments($monthlyInvestments: PortfolioMonthlyInvestmentsDTOInput)
 {
    importPortfolioMonthlyInvestments(monthlyInvestments: $monthlyInvestments){
      enableInPfCurrency
      rows {
        amount
        date
        security
        selectedMonths
      }
      portfolio
    }
}
`;

/**
 * Import monthly investments profile data.
 */
export const useSetMonthlyInvestments = (mode = "New" as mode) => {
  const { t } = useModifiedTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [handleSetMonthlyInvestments] = useMutation<
    SetMonthlyInvestmentsMutationResponse,
    SetMonthlyInvestmentsMutationVariables
  >(SET_MONTHLY_INVESTMENTS_MUTATION);

  const setMonthlyInvestments = async (
    monthlyInvestments: SetMonthlyInvestmentsMutationVariables["monthlyInvestments"]
  ) => {
    setSubmitting(true);
    try {
      const apiResponse = await handleSetMonthlyInvestments({
        variables: {
          monthlyInvestments: monthlyInvestments,
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
  if (!apiResponse.data || !apiResponse.data.importPortfolioMonthlyInvestments) {
    console.log("Test")
    throw new Error("Error while setting monthly investments");
  }
};
