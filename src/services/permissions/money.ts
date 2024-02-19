import { Portfolio, PortfolioGroups } from "api/common/useGetContactInfo";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { isPortfolioInGroup, isPortfolioOptionInGroup } from "./common";
import { PermissionMode, usePermission } from "./usePermission";

export const isPortfolioDepositable = (portfolio: Portfolio) => {
  return isPortfolioInGroup(portfolio, PortfolioGroups.DEPOSIT);
};

export const isPortfolioOptionDepositable = (
  portfolioOption: PortfolioOption
) => {
  const isDepositable =
    portfolioOption.details && isPortfolioDepositable(portfolioOption.details);
  if (isDepositable) return true;
  return false;
};

export const useCanDeposit = () => {
  return usePermission(PermissionMode.ANY, isPortfolioDepositable);
};

export const isPortfolioWithdrawable = (portfolio: Portfolio) =>
  isPortfolioInGroup(portfolio, PortfolioGroups.WITHDRAW);

export const isPortfolioOptionWithdrawable = (
  portfolioOption: PortfolioOption
) => {
  return isPortfolioOptionInGroup(portfolioOption, PortfolioGroups.WITHDRAW);
};

export const useCanWithdraw = () => {
  return usePermission(PermissionMode.ANY, isPortfolioWithdrawable);
};
