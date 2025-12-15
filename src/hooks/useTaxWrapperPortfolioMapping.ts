import { useMemo } from "react";
import { useGetContactInfo } from "api/common/useGetContactInfo";
import type { ClientTaxAllowance } from "api/taxes/useGetClientTaxAllowances";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useGetContractIdData } from "providers/ContractIdProvider";

export interface MappedPortfolio {
  id: number;
  code: string;
  name: string;
}

export interface TaxWrapperWithPortfolios extends ClientTaxAllowance {
  mappedPortfolios: MappedPortfolio[];
  isConstrainedByParent?: boolean;
  parentRemainingAmount?: number;
}

/**
 * Hook that maps tax wrapper portfolio types to actual user portfolios
 * This enables showing the correct portfolios in ISA sections and preselecting them in deposit modal
 */
export const useTaxWrapperPortfolioMapping = (
  taxAllowances: ClientTaxAllowance[]
) => {
  const { selectedContactId } = useGetContractIdData();
  const { data: contactInfo } = useGetContactInfo(false, selectedContactId);
  const { t } = useModifiedTranslation();

  const portfolios = useMemo(
    () => contactInfo?.portfolios || [],
    [contactInfo?.portfolios]
  );

  const mappedTaxAllowances: TaxWrapperWithPortfolios[] = useMemo(() => {
    return taxAllowances.map((allowance) => {
      // Find portfolios that match the tax wrapper's portfolio types
      const mappedPortfolios = portfolios
        .filter((portfolio) => {
          // Match portfolio type codes between tax wrapper and actual portfolios
          return allowance.portfolioTypes.some(
            (wrapperPortfolioType) =>
              portfolio.typeCode === wrapperPortfolioType.code
          );
        })
        .map((portfolio) => ({
          id: portfolio.id,
          code:
            portfolio.shortName ||
            t("utils.portfolio.fallbackCode", { id: portfolio.id }),
          name:
            portfolio.name ||
            t("utils.portfolio.fallbackName", { id: portfolio.id }),
        }));

      return {
        ...allowance,
        mappedPortfolios,
      };
    });
  }, [taxAllowances, portfolios, t]);

  return {
    mappedTaxAllowances,
    allPortfolios: portfolios,
  };
};
