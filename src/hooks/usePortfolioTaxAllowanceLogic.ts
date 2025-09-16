import { useMemo } from "react";
import { ClientTaxAllowancesResult, ClientTaxAllowance } from "api/taxes/useGetClientTaxAllowances";

interface Portfolio {
  id: number;
  typeCode?: string;
  name?: string;
}

interface UsePortfolioTaxAllowanceLogicParams {
  taxAllowanceData: ClientTaxAllowancesResult | undefined;
  selectedPortfolio: Portfolio | undefined;
}

interface PortfolioTaxAllowanceResult {
  isPortfolioTaxAdvantaged: boolean;
  remainingAllowance: number;
  totalAllowance: number;
  currency: string;
  hasZeroAllowance: boolean | undefined;
  availableTaxWrapperCodes: string[];
  isaAllowance: ClientTaxAllowance | null;
  childAllowance: ClientTaxAllowance | undefined;
  isAmountOverAllowance: (amount: number) => boolean;
}

/**
 * Custom hook that handles ISA allowance logic for portfolios
 * Determines if a portfolio is tax-advantaged and calculates effective allowances
 */
export const usePortfolioTaxAllowanceLogic = ({
  taxAllowanceData,
  selectedPortfolio,
}: UsePortfolioTaxAllowanceLogicParams): PortfolioTaxAllowanceResult => {
  
  const result = useMemo((): PortfolioTaxAllowanceResult => {
    // Get ISA and child allowances from the data
    const isaAllowance = taxAllowanceData?.isaAllowance ?? null;
    const childAllowance = taxAllowanceData?.childAllowances?.find(
      (child) => child.taxWrapperCode === selectedPortfolio?.typeCode
    ) ?? undefined;
    
    // Determine available tax wrapper codes
    // A portfolio is tax-advantaged if its typeCode matches:
    // 1. The ISA parent tax wrapper code, OR
    // 2. Any of the ISA child tax wrapper codes
    const availableTaxWrapperCodes = [
      ...(isaAllowance ? [isaAllowance.taxWrapperCode] : []),
      ...(taxAllowanceData?.childAllowances?.map(child => child.taxWrapperCode) || [])
    ];
    
    const isPortfolioTaxAdvantaged = Boolean(
      selectedPortfolio?.typeCode && 
      availableTaxWrapperCodes.includes(selectedPortfolio.typeCode)
    );
    
    // Calculate effective allowances
    // The true remaining allowance is the minimum of the parent's and the specific child's allowance
    // For non-tax-advantaged portfolios, there's no allowance limit (Infinity)
    const remainingAllowance = isPortfolioTaxAdvantaged 
      ? Math.min(
          isaAllowance?.remainingAllowance ?? Infinity,
          childAllowance?.remainingAllowance ?? Infinity
        )
      : Infinity;
    
    // The total allowance should also reflect the selected portfolio's specific limits
    // Take the minimum of parent and child total allowances
    const totalAllowance = isPortfolioTaxAdvantaged
      ? Math.min(
          isaAllowance?.totalAllowance ?? Infinity,
          childAllowance?.totalAllowance ?? Infinity
        )
      : 0;
    
    const currency = taxAllowanceData?.summary?.currency ?? "GBP";
    const hasZeroAllowance: boolean | undefined = taxAllowanceData ? remainingAllowance <= 0 : undefined;
    
    return {
      isPortfolioTaxAdvantaged,
      remainingAllowance,
      totalAllowance,
      currency,
      hasZeroAllowance,
      availableTaxWrapperCodes,
      isaAllowance,
      childAllowance,
      isAmountOverAllowance: (amount: number) => amount > remainingAllowance,
    };
  }, [taxAllowanceData, selectedPortfolio]);

  return result;
};
