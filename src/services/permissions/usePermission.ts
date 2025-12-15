import { useCallback } from "react";
import type {
  Portfolio,
  PortfolioGroups,
  RepresentativeTag,
} from "api/common/useGetContactInfo";
import { useGetContactInfo } from "api/common/useGetContactInfo";
import type { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { useGetContactRepTagsAndLinkedContact } from "hooks/useGetContactRepTagsAndLinkedContact";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useParams } from "react-router-dom";
import { isPortfolioEligible, isPortfolioOptionEligible } from "./common";

export enum PermissionMode {
  ANY,
  SELECTED,
  SELECTED_ANY,
}

export interface PortfolioFilterFunction {
  (
    contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
    portfolio: Portfolio,
    linkedContact: string | undefined
  ): boolean;
}

export interface PortfolioOptionFilterFunction {
  (
    contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
    portfolioOption: PortfolioOption,
    linkedContact: string | undefined
  ): boolean;
}

const doesAnyPortfolioHavePermission = (
  portfolios: Portfolio[],
  filterFunction: (portfolio: Portfolio) => boolean
) => portfolios.some((p) => filterFunction(p));

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
) => selectedPortfolio(portfolios, portfolioId).some((p) => filterFunction(p));

/*
 * Checks if user's contact or portfolio is eligible
 * @param mode: mode to apply when checking if eligible
 * SELECTED - check only the selected portfolio
 * ANY - check any of the user's contact's portfolios
 * SELECTED_ANY - use SELECTED if there is a selected portfolio, else do ANY
 * @param filterFunction: predicate function that can return false or true for a given Portfolio
 * @return boolean - whether user's contact can
 */
export const usePermission = (
  mode: PermissionMode,
  filterFunction: (portfolio: Portfolio) => boolean
) => {
  const { portfolioId } = useParams();
  const { selectedContactId } = useGetContractIdData();
  const { data: selectedContactData } = useGetContactInfo(
    false,
    selectedContactId
  );

  const portfolios = selectedContactData?.portfolios ?? [];

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

export const useFeature = (
  portfolioGroup: PortfolioGroups,
  representativeTag: RepresentativeTag,
  permissionMode: PermissionMode
) => {
  const { linkedContact, contactRepresentativeTags } =
    useGetContactRepTagsAndLinkedContact();
  /**
   * Checks if the user's linked contact can access a feature in a specific portfolio.
   */
  const canPf = useCallback(
    (portfolio: Portfolio) =>
      isPortfolioEligible(
        contactRepresentativeTags,
        portfolio,
        linkedContact,
        portfolioGroup,
        representativeTag
      ),
    [
      contactRepresentativeTags,
      linkedContact,
      portfolioGroup,
      representativeTag,
    ]
  );
  /**
   * Checks if the user's linked contact can access a feature in a specific portfolio option.
   */
  const canPfOption = useCallback(
    (portfolioOption: PortfolioOption) =>
      isPortfolioOptionEligible(
        contactRepresentativeTags,
        portfolioOption,
        linkedContact,
        portfolioGroup,
        representativeTag
      ),
    [
      contactRepresentativeTags,
      linkedContact,
      portfolioGroup,
      representativeTag,
    ]
  );

  /**
   * Whether the user can access the feature at all in the app.
   */
  const canFeature = usePermission(permissionMode, canPf);

  return {
    canFeature,
    canPf,
    canPfOption,
  };
};
