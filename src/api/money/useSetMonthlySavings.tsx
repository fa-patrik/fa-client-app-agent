import { useState } from "react";
import type { FetchResult } from "@apollo/client";
import { gql, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { useModifiedTranslation } from "../../hooks/useModifiedTranslation";

type mode = "Delete" | "New";

/**
 * Representing the FA Back Portfolio Savings plan profile.
 */
export interface PortfolioMonthlySavingsDTOInput {
  portfolio: string;
  amount: number;
  date: number;
  selectedMonths: number[];
  validFromDate?: Date;
  validToDate?: Date;
  useInvestmentPlan?: boolean;
  enable: boolean;
}

interface SetMonthlySavingsMutationVariables {
  monthlySavings: PortfolioMonthlySavingsDTOInput;
}

interface SetMonthlySavingsMutationResponse {
  importPortfolioMonthlySavings: PortfolioMonthlySavingsDTOInput;
}

const SET_MONTHLY_SAVINGS_MUTATION = gql`
  mutation setMonthlySavings($monthlySavings: PortfolioMonthlySavingsDTOInput) {
    importPortfolioMonthlySavings(monthlySavings: $monthlySavings) {
      enable
      portfolio
      amount
      date
      selectedMonths
    }
  }
`;

/**
 * Import monthly savings profile data.
 */
export const useSetMonthlySavings = (mode = "New" as mode) => {
  const { t } = useModifiedTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [handleSetMonthlySavings] = useMutation<
    SetMonthlySavingsMutationResponse,
    SetMonthlySavingsMutationVariables
  >(SET_MONTHLY_SAVINGS_MUTATION);

  const setMonthlySavings = async (
    monthlySavings: SetMonthlySavingsMutationVariables["monthlySavings"]
  ) => {
    setSubmitting(true);
    try {
      const apiResponse = await handleSetMonthlySavings({
        variables: {
          monthlySavings: monthlySavings,
        },
      });

      handleBadAPIResponse(apiResponse);
      toast.success(
        t(
          mode === "Delete"
            ? t("messages.monthlySavingsDeletedSuccess")
            : t("messages.monthlySavingsNewSuccess")
        ),
        { autoClose: 3000, closeButton: false, position: "top-center" }
      );
      setSubmitting(false);
      return apiResponse;
    } catch (e: unknown) {
      toast.error(t("messages.error"), {
        style: { whiteSpace: "pre-line" },
        closeButton: false,
        autoClose: 3000,
        position: "top-center",
      });
      setSubmitting(false);
    }
  };

  return { setMonthlySavings, submitting };
};

const handleBadAPIResponse = (
  apiResponse: FetchResult<
    SetMonthlySavingsMutationResponse,
    Record<string, unknown>,
    Record<string, unknown>
  >
) => {
  if (!apiResponse.data || !apiResponse.data.importPortfolioMonthlySavings) {
    throw new Error("Error while setting monthly savings");
  }
};
