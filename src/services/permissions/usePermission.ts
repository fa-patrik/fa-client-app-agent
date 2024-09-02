import {
  Portfolio,
  RepresentativeTag,
  useGetContactInfo,
} from "api/common/useGetContactInfo";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { useParams } from "react-router-dom";

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
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  portfolios: Portfolio[],
  linkedContact: string | undefined,
  filterFunction: PortfolioFilterFunction
) =>
  portfolios.some((p) =>
    filterFunction(contactRepresentativeTags, p, linkedContact)
  );

const selectedPortfolio = (
  portfolios: Portfolio[],
  portfolioId: string | undefined
) =>
  portfolios.filter(
    (portfolio) =>
      portfolioId !== undefined && portfolio.id === parseInt(portfolioId, 10)
  );

const doesSelectedPortfolioHavePermission = (
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  portfolios: Portfolio[],
  portfolioId: string | undefined,
  linkedContact: string | undefined,
  filterFunction: PortfolioFilterFunction
) =>
  selectedPortfolio(portfolios, portfolioId).some((p) =>
    filterFunction(contactRepresentativeTags, p, linkedContact)
  );

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
  filterFunction: PortfolioFilterFunction
) => {
  const { linkedContact } = useKeycloak();
  const { portfolioId } = useParams();
  const { selectedContactId } = useGetContractIdData();
  const { data: selectedContactData } = useGetContactInfo(
    false,
    selectedContactId
  );

  const portfolios = selectedContactData?.portfolios ?? [];

  switch (mode) {
    case PermissionMode.ANY:
      return doesAnyPortfolioHavePermission(
        selectedContactData?.representativeTags,
        portfolios,
        linkedContact,
        filterFunction
      );
    case PermissionMode.SELECTED:
      return doesSelectedPortfolioHavePermission(
        selectedContactData?.representativeTags,
        portfolios,
        portfolioId,
        linkedContact,
        filterFunction
      );
    case PermissionMode.SELECTED_ANY:
      if (portfolioId !== undefined)
        return doesSelectedPortfolioHavePermission(
          selectedContactData?.representativeTags,
          portfolios,
          portfolioId,
          linkedContact,
          filterFunction
        );
      return doesAnyPortfolioHavePermission(
        selectedContactData?.representativeTags,
        portfolios,
        linkedContact,
        filterFunction
      );
    default:
      return false;
  }
};
