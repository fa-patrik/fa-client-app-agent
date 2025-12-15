import { useMemo } from "react";
import type { Portfolio } from "api/common/useGetContactInfo";
import { useGetContactInfo } from "api/common/useGetContactInfo";
import { useGetContractIdData } from "providers/ContractIdProvider";

export const getSubPortfolioIds = (portfolio: Portfolio | undefined) => {
  if (!portfolio) return [];
  return portfolio?.portfolios?.reduce((prev, currSubPortfolio) => {
    prev.push(currSubPortfolio.id);
    const subSubPortfolioId = getSubPortfolioIds(currSubPortfolio);
    prev.push(...subSubPortfolioId);
    return prev;
  }, [] as number[]);
};

/**
 * Gets the ids of all sub portfolios of portfolio with id.
 * Reuses cached data with useGetContactInfo(), which does not include
 * closed portfolios.
 * @param id id of the parent portfolio.
 * @returns list of ids of the the sub portfolios to the parent portfolio.
 */
export const useGetSubPortfolioIds = (
  id: number | undefined,
  includeId = true
) => {
  const { selectedContactId } = useGetContractIdData();
  const { data } = useGetContactInfo(false, selectedContactId);
  return useMemo(() => {
    if (!id) return [];
    const subIds = getSubPortfolioIds(
      data?.portfolios?.find((p) => p.id === id)
    );
    if (!includeId) return subIds;
    return [id, ...subIds];
  }, [id, data?.portfolios, includeId]);
};
