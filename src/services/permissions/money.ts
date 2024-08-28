import {
  Portfolio,
  PortfolioGroups,
  RepresentativeTag,
} from "api/common/useGetContactInfo";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { isPortfolioEligible, isPortfolioOptionEligible } from "./common";
import { PermissionMode, usePermission } from "./usePermission";

export const isPortfolioDepositable = (
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  portfolio: Portfolio,
  linkedContact: string | undefined
) => {
  return isPortfolioEligible(
    contactRepresentativeTags,
    portfolio,
    linkedContact,
    PortfolioGroups.DEPOSIT,
    RepresentativeTag.DEPOSIT
  );
};

export const isPortfolioOptionDepositable = (
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  portfolioOption: PortfolioOption,
  linkedContact: string | undefined
) => {
  return isPortfolioOptionEligible(
    contactRepresentativeTags,
    portfolioOption,
    linkedContact,
    PortfolioGroups.DEPOSIT,
    RepresentativeTag.DEPOSIT
  );
};

export const useCanDeposit = () => {
  return usePermission(PermissionMode.ANY, isPortfolioDepositable);
};

export const isPortfolioWithdrawable = (
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  portfolio: Portfolio,
  linkedContact: string | undefined
) => {
  return isPortfolioEligible(
    contactRepresentativeTags,
    portfolio,
    linkedContact,
    PortfolioGroups.WITHDRAW,
    RepresentativeTag.WITHDRAW
  );
};

export const isPortfolioOptionWithdrawable = (
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  portfolioOption: PortfolioOption,
  linkedContact: string | undefined
) => {
  return isPortfolioOptionEligible(
    contactRepresentativeTags,
    portfolioOption,
    linkedContact,
    PortfolioGroups.WITHDRAW,
    RepresentativeTag.WITHDRAW
  );
};

export const useCanWithdraw = () => {
  return usePermission(PermissionMode.ANY, isPortfolioWithdrawable);
};
