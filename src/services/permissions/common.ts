import {
  Portfolio,
  PortfolioGroups,
  RepresentativeTag,
} from "api/common/useGetContactInfo";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";

/**
 * Checks whether the user's linked contact is linked to the portfolio
 * and whether that link has the given tag
 * @param portfolio the portfolio to check
 * @param tag a "Client portal:..." tag
 * @param linkedContact the contact id of the logged in user
 * @returns true if the portfolio has the tag
 */
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

/**
 * Checks whether the user's linked contact is linked to the selected contact
 * and whether that link has the given tag
 * @param contactRepresentativeTags the contact's representative tags
 * @param tag a "Client portal:..." tag
 * @param linkedContact the contact id of the logged in user
 * @returns true if the contact has the tag in the particular link
 */
export const doesContactHaveRepresentativeTag = (
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  tag: RepresentativeTag,
  linkedContact: string | undefined
) => {
  if (!linkedContact || !contactRepresentativeTags) return false;
  const contactTags = contactRepresentativeTags?.[linkedContact] ?? [];
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

export const isPortfolioEligible = (
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  portfolio: Portfolio,
  linkedContact: string | undefined,
  portfolioGroup: PortfolioGroups,
  representativeTag: RepresentativeTag
) => {
  return (
    isPortfolioInGroup(portfolio, portfolioGroup) ||
    doesPortfolioHaveRepresentativeTag(
      portfolio,
      representativeTag,
      linkedContact
    ) ||
    doesContactHaveRepresentativeTag(
      contactRepresentativeTags,
      representativeTag,
      linkedContact
    )
  );
};

export const isPortfolioOptionEligible = (
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  portfolioOption: PortfolioOption,
  linkedContact: string | undefined,
  portfolioGroup: PortfolioGroups,
  representativeTag: RepresentativeTag
) => {
  return (
    isPortfolioOptionInGroup(portfolioOption, portfolioGroup) ||
    doesPortfolioHaveRepresentativeTag(
      portfolioOption.details,
      representativeTag,
      linkedContact
    ) ||
    doesContactHaveRepresentativeTag(
      contactRepresentativeTags,
      representativeTag,
      linkedContact
    )
  );
};
