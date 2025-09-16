import { useMemo } from "react";
import { StandardSolutionTaxWrapper } from "api/enums";
import { useGetAvailableTaxWrappers } from "./useGetAvailableTaxWrappers";
import { useGetClientTaxAllowances, TaxWrapperCalculationDetail } from "./useGetClientTaxAllowances";

export interface UseGetClientTaxAllowancesWithWrappersParams {
  contactId: string;
  calcDate?: string;
  skip?: boolean;
}

/**
 * Hook that combines available tax wrappers with client-specific allowances
 * Automatically builds calculation details for ISA and its children
 */
export const useGetClientTaxAllowancesWithWrappers = ({
  contactId,
  calcDate = new Date().toISOString().split('T')[0], // Default to current date
  skip = false,
}: UseGetClientTaxAllowancesWithWrappersParams) => {
  const {
    data: taxWrappersData,
    loading: taxWrappersLoading,
    error: taxWrappersError
  } = useGetAvailableTaxWrappers();

  // Build calculation details - we want ISA and its children (CISA, SSISA), not APS
  const calculationDetails: TaxWrapperCalculationDetail[] = useMemo(() => {
    if (!taxWrappersData?.taxWrappers) return [];

    // The "main" ISA wrapper
    const isaWrapper = taxWrappersData.taxWrappers.find(
      wrapper => wrapper.code === StandardSolutionTaxWrapper.IndividualSavingsAccount
    );
    if (!isaWrapper) return [];

    const details: TaxWrapperCalculationDetail[] = [];

    // Map all tax wrappers
    taxWrappersData.taxWrappers.forEach(wrapper => {
      details.push({ taxWrapperCode: wrapper.code, calcDate });
    });

    return details;
  }, [taxWrappersData?.taxWrappers, calcDate]);

  const {
    loading: allowancesLoading,
    error: allowancesError,
    data: allowancesData
  } = useGetClientTaxAllowances({
    contactId,
    calculationDetails,
    skip: skip || taxWrappersLoading || !calculationDetails.length,
  });

  return {
    loading: taxWrappersLoading || allowancesLoading,
    error: taxWrappersError || allowancesError,
    data: allowancesData,
    availableTaxWrappers: taxWrappersData?.taxWrappers || [],
    hasAvailableTaxWrappers: Boolean(taxWrappersData?.taxWrappers?.length),
  };
};
