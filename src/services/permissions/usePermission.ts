import {
  Portfolio,
  PortfolioGroups,
  useGetContactInfo,
} from "api/initial/useGetContactInfo";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useParams } from "react-router-dom";

export enum PermissionMode {
  ANY,
  SELECTED,
  SELECTED_ANY,
}

export const isPortfolioInGroup = (
  portfolio: Portfolio,
  groupCode: PortfolioGroups
) => portfolio.portfolioGroups.some((group) => group.code === groupCode);

export const isPortfolioOptionInGroup = (
  portfolioOption: PortfolioOption,
  groupCode: PortfolioGroups
) => {
  const itCan =
    portfolioOption?.details &&
    isPortfolioInGroup(portfolioOption?.details, groupCode);
  if (itCan) return true;
  return false;
};

//Monthly investments
export const canPortfolioMonthlyInvest = (portfolio: Portfolio) => {
  return isPortfolioInGroup(portfolio, PortfolioGroups.MONTHLY_INVESTMENTS);
};

export const canPortfolioOptionMonthlyInvest = (
  portfolioOption: PortfolioOption
) => {
  return isPortfolioOptionInGroup(
    portfolioOption,
    PortfolioGroups.MONTHLY_INVESTMENTS
  );
};

//Trading
export const canPortfolioTrade = (portfolio: Portfolio) => {
  return isPortfolioInGroup(portfolio, PortfolioGroups.TRADE);
};

export const canPortfolioOptionTrade = (portfolioOption: PortfolioOption) => {
  return isPortfolioOptionInGroup(portfolioOption, PortfolioGroups.TRADE);
};

export const tradableTag = "Tradeable";

/*
 * Checks if user or portfolio is eligible
 * @param mode: mode to apply when checking if eligible
 * SELECTED - check only the selected portfolio
 * ANY - check any of the user's portfolios
 * SELECTED_ANY - use SELECTED_ONLY if there is a selected portfolio, else do ANY
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

  const doesAnyPortfolioHavePermission = portfolios.some((p) =>
    filterFunction(p)
  );
  const selectedPortfolio = portfolios.filter(
    (portfolio) =>
      portfolioId !== undefined && portfolio.id === parseInt(portfolioId, 10)
  );
  const doesSelectedPortfolioHavePermission = selectedPortfolio.some((p) =>
    filterFunction(p)
  );

  switch (mode) {
    case PermissionMode.ANY:
      return doesAnyPortfolioHavePermission;
    case PermissionMode.SELECTED:
      return doesSelectedPortfolioHavePermission;
    case PermissionMode.SELECTED_ANY:
      if (portfolioId !== undefined) return doesSelectedPortfolioHavePermission;
      return doesAnyPortfolioHavePermission;
    default:
      return false;
  }
};
