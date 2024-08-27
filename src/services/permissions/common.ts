import {
  ContactInfoQuery,
  Portfolio,
  PortfolioGroups,
  RepresentativeTag,
} from "api/common/useGetContactInfo";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";

export const doesPortfolioHaveRepresentativeTag = (
  portfolio: Portfolio | undefined,
  tag: RepresentativeTag,
  linkedContact: string | undefined
) => {
  if (!linkedContact || !portfolio) return false;
  const portfolioContactTags =
    portfolio?.representativeTags?.portfolioContacts?.[linkedContact] ?? [];
  const portfolioAssetManagerTags =
    portfolio?.representativeTags?.portfolioAssetManagers?.[linkedContact] ??
    [];
  return (
    portfolioContactTags?.includes(tag) ||
    portfolioAssetManagerTags?.includes(tag)
  );
};

export const doesContactHaveRepresentativeTag = (
  contact: ContactInfoQuery["contact"],
  tag: RepresentativeTag,
  linkedContact: string | undefined
) => {
  if (!linkedContact || !contact) return false;
  const contactTags =
    contact?.representativeTags?.representatives?.[linkedContact];
  return contactTags?.includes(tag);
};

export const isPortfolioInGroup = (
  portfolio: Portfolio,
  groupCode: PortfolioGroups
) => portfolio?.portfolioGroups?.some((group) => group.code === groupCode);

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
