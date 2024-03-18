import { Portfolio, useGetContactInfo } from "api/common/useGetContactInfo";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useParams } from "react-router-dom";

export enum PermissionMode {
  ANY,
  SELECTED,
  SELECTED_ANY,
}

const doesAnyPortfolioHavePermission = (
  portfolios: Portfolio[],
  filterFunction: (portfolio: Portfolio) => boolean
) => portfolios.some(filterFunction);

const selectedPortfolio = (
  portfolios: Portfolio[],
  portfolioId: string | undefined
) =>
  portfolios.filter(
    (portfolio) =>
      portfolioId !== undefined && portfolio.id === parseInt(portfolioId, 10)
  );

const doesSelectedPortfolioHavePermission = (
  portfolios: Portfolio[],
  portfolioId: string | undefined,
  filterFunction: (portfolio: Portfolio) => boolean
) => selectedPortfolio(portfolios, portfolioId).some(filterFunction);

/*
 * Checks if user or portfolio is eligible
 * @param mode: mode to apply when checking if eligible
 * SELECTED - check only the selected portfolio
 * ANY - check any of the user's portfolios
 * SELECTED_ANY - use SELECTED if there is a selected portfolio, else do ANY
 * @param filterFunction: predicate function that can return false or true for a given Portfolio
 * @return boolean - whether user can
 */
export const usePermission = (
  mode = PermissionMode.SELECTED,
  filterFunction: (portfolio: Portfolio) => boolean
) => {
  const { portfolioId } = useParams();
  const { selectedContactId } = useGetContractIdData();
  const { data: { portfolios } = { portfolios: [] } } = useGetContactInfo(
    false,
    selectedContactId
  );

  switch (mode) {
    case PermissionMode.ANY:
      return doesAnyPortfolioHavePermission(portfolios, filterFunction);
    case PermissionMode.SELECTED:
      return doesSelectedPortfolioHavePermission(
        portfolios,
        portfolioId,
        filterFunction
      );
    case PermissionMode.SELECTED_ANY:
      if (portfolioId !== undefined)
        return doesSelectedPortfolioHavePermission(
          portfolios,
          portfolioId,
          filterFunction
        );
      return doesAnyPortfolioHavePermission(portfolios, filterFunction);
    default:
      return false;
  }
};
