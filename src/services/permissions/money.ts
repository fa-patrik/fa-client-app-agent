import {
  Portfolio,
  PortfolioGroups,
  RepresentativeTag,
} from "api/common/useGetContactInfo";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import {
  doesPortfolioHaveRepresentativeTag,
  isPortfolioInGroup,
  isPortfolioOptionInGroup,
} from "./common";
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

export const isPortfolioWithdrawable = (
  portfolio: Portfolio,
  linkedContact: string | undefined
) =>
  isPortfolioInGroup(portfolio, PortfolioGroups.WITHDRAW) ||
  doesPortfolioHaveRepresentativeTag(
    portfolio,
    RepresentativeTag.WITHDRAW,
    linkedContact
  );

export const isPortfolioOptionWithdrawable = (
  portfolioOption: PortfolioOption,
  linkedContact: string | undefined
) => {
  return (
    isPortfolioOptionInGroup(portfolioOption, PortfolioGroups.WITHDRAW) ||
    doesPortfolioHaveRepresentativeTag(
      portfolioOption.details,
      RepresentativeTag.WITHDRAW,
      linkedContact
    )
  );
};

export const useCanWithdraw = () => {
  return usePermission(PermissionMode.ANY, isPortfolioWithdrawable);
};
