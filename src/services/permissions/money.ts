import {
  Portfolio,
  PortfolioGroups,
  RepresentativeTag,
} from "api/common/useGetContactInfo";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import {
  doesContactHaveRepresentativeTag,
  doesPortfolioHaveRepresentativeTag,
  isPortfolioInGroup,
  isPortfolioOptionInGroup,
} from "./common";
import { PermissionMode, usePermission } from "./usePermission";

export const isPortfolioDepositable = (
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  portfolio: Portfolio,
  linkedContact: string | undefined
) => {
  return (
    isPortfolioInGroup(portfolio, PortfolioGroups.DEPOSIT) ||
    doesPortfolioHaveRepresentativeTag(
      portfolio,
      RepresentativeTag.DEPOSIT,
      linkedContact
    ) ||
    doesContactHaveRepresentativeTag(
      contactRepresentativeTags,
      RepresentativeTag.DEPOSIT,
      linkedContact
    )
  );
};

export const isPortfolioOptionDepositable = (
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  portfolioOption: PortfolioOption,
  linkedContact: string | undefined
) => {
  const isDepositable =
    portfolioOption.details &&
    isPortfolioDepositable(
      contactRepresentativeTags,
      portfolioOption.details,
      linkedContact
    );
  if (isDepositable) return true;
  return false;
};

export const useCanDeposit = () => {
  return usePermission(PermissionMode.ANY, isPortfolioDepositable);
};

export const isPortfolioWithdrawable = (
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  portfolio: Portfolio,
  linkedContact: string | undefined
) =>
  isPortfolioInGroup(portfolio, PortfolioGroups.WITHDRAW) ||
  doesPortfolioHaveRepresentativeTag(
    portfolio,
    RepresentativeTag.WITHDRAW,
    linkedContact
  ) ||
  doesContactHaveRepresentativeTag(
    contactRepresentativeTags,
    RepresentativeTag.WITHDRAW,
    linkedContact
  );

export const isPortfolioOptionWithdrawable = (
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  portfolioOption: PortfolioOption,
  linkedContact: string | undefined
) => {
  return (
    isPortfolioOptionInGroup(portfolioOption, PortfolioGroups.WITHDRAW) ||
    doesPortfolioHaveRepresentativeTag(
      portfolioOption.details,
      RepresentativeTag.WITHDRAW,
      linkedContact
    ) ||
    doesContactHaveRepresentativeTag(
      contactRepresentativeTags,
      RepresentativeTag.WITHDRAW,
      linkedContact
    )
  );
};

export const useCanWithdraw = () => {
  return usePermission(PermissionMode.ANY, isPortfolioWithdrawable);
};
