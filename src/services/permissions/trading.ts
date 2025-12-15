import { useMemo, useState } from "react";
import type { Portfolio } from "api/common/useGetContactInfo";
import {
  PortfolioGroups,
  RepresentativeTag,
  useGetContactInfo,
} from "api/common/useGetContactInfo";
import { useGetTradebleSecurities } from "api/trading/useGetTradebleSecurities";
import type { SecurityGroup } from "api/types";
import type { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { PermissionMode, useFeature } from "./usePermission";

export const CLIENT_PORTAL_SECURITY_GROUP_PREFIX = "CP_";
export const CLIENT_PORTAL_ADVISOR_SECURITY_GROUP_PREFIX = "ADV_";
export const tradableTag = "Tradeable";
export const switchableTag = "Switchable";

type Security = {
  groups: SecurityGroup[];
  tagsAsSet: string[];
};

export const isSecurityTradable = (tags: string[]) => {
  return tags?.includes(tradableTag);
};

export const isSecuritySwitchable = (tags: string[]) => {
  return tags?.includes(switchableTag);
};

//In which securities can it trade (linked security groups starting with CP_)
export const isPortfolioLinkedToSecurityGroups = (
  portfolio: Portfolio,
  securityGroups: SecurityGroup[] | undefined,
  groupPrefix: string
) => {
  try {
    return portfolio?.securityGroups?.some((sg) => {
      if (sg.code?.startsWith(groupPrefix)) {
        return securityGroups?.some(
          (securityGroup) => sg.code === securityGroup.code
        );
      }
      return false;
    });
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const isPortfolioLinkedToAnySecurityGroup = (
  portfolio: Portfolio,
  groupPrefix: string
) => {
  try {
    return portfolio?.securityGroups?.some((sg) =>
      sg.code.startsWith(groupPrefix)
    );
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const canPortfolioOptionTradeSecurity = (
  portfolioOption: PortfolioOption,
  securityGroups: SecurityGroup[] | undefined,
  groupPrefix: string
) => {
  try {
    if (!portfolioOption.details) return false; //no data available
    return canPortfolioTradeSecurityGroups(
      portfolioOption.details,
      securityGroups,
      groupPrefix
    );
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const canPortfolioTradeSecurityGroups = (
  portfolio: Portfolio,
  securityGroups: SecurityGroup[] | undefined,
  groupPrefix: string
) => {
  try {
    if (!isPortfolioLinkedToAnySecurityGroup(portfolio, groupPrefix)) {
      //can trade all securities
      return true;
    } else {
      //can trade linked securities
      return isPortfolioLinkedToSecurityGroups(
        portfolio,
        securityGroups,
        groupPrefix
      );
    }
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const canPortfolioTradeSecurity = (
  portfolio: Portfolio,
  security: Security,
  groupPrefix: string
) => {
  try {
    if (isSecurityTradable(security.tagsAsSet)) {
      if (!isPortfolioLinkedToAnySecurityGroup(portfolio, groupPrefix)) {
        //can trade all securities
        return true;
      } else {
        //can trade linked securities
        return isPortfolioLinkedToSecurityGroups(
          portfolio,
          security.groups,
          groupPrefix
        );
      }
    } else {
      //can't trade
      return false;
    }
  } catch (e) {
    console.error(e);
    return false;
  }
};

type GetTradableSecuritiesProps = {
  currencyCode?: string;
  tags?: string[];
};

/**
 * Returns the securities that can be traded by the contact, or (if provided) the portfolio.
 * Queries FA Back.
 * @param options options when querying the securities from FA Back.
 * @param portfolioId portfolio to check (contact if omitted).
 * @returns tradable securities.
 */
export const useGetPermittedSecurities = (
  options?: GetTradableSecuritiesProps,
  portfolioId?: number
) => {
  const { canPf: canPfTrade } = useFeature(
    PortfolioGroups.TRADE,
    RepresentativeTag.TRADE,
    PermissionMode.SELECTED_ANY
  );
  const { access } = useKeycloak();
  const groupPrefix = access.advisor
    ? CLIENT_PORTAL_ADVISOR_SECURITY_GROUP_PREFIX
    : CLIENT_PORTAL_SECURITY_GROUP_PREFIX;
  const [loading, setLoading] = useState(false);
  const { selectedContactId } = useGetContractIdData();
  const {
    data: contactData,
    loading: loadingContactData,
    error: contactError,
  } = useGetContactInfo(false, selectedContactId);

  // Calculate security group IDs for server-side filtering optimization
  const securityGroupIds = useMemo(() => {
    if (!contactData?.portfolios) {
      return []; // No data → fetch all, apply client-side filtering
    }

    if (portfolioId) {
      // Single portfolio selected
      const portfolio = contactData.portfolios.find(
        (p) => p.id === portfolioId
      );
      if (!portfolio?.securityGroups || portfolio.securityGroups.length === 0) {
        return []; // No groups → fetch all, apply client-side filtering
      }
      // Portfolio has groups → use server-side filtering
      return portfolio.securityGroups.map((sg) => sg.id);
    } else {
      // No specific portfolio selected - check ALL portfolios
      const allPortfolios = contactData.portfolios;
      const hasAnyPortfolioWithoutGroups = allPortfolios.some(
        (p) => !p.securityGroups || p.securityGroups.length === 0
      );

      if (hasAnyPortfolioWithoutGroups) {
        return []; // Some portfolios have no restrictions → fetch all, apply client-side filtering
      }

      // ALL portfolios have group IDs → use server-side filtering
      const allGroupIds = new Set<number>();
      allPortfolios.forEach((p) => {
        p.securityGroups?.forEach((sg) => allGroupIds.add(sg.id));
      });
      return Array.from(allGroupIds);
    }
  }, [portfolioId, contactData?.portfolios]);

  const {
    filters,
    setFilters,
    filterOptions,
    data: securities,
    loading: loadingSecurities,
    error: securitiesError,
  } = useGetTradebleSecurities(
    options?.currencyCode,
    options?.tags,
    securityGroupIds
  );

  const portfolio = portfolioId
    ? contactData?.portfolios.find((p) => p.id === portfolioId)
    : undefined;

  const tradable = useMemo(() => {
    setLoading(true);
    try {
      let result;
      if (securities) {
        if (portfolio && canPfTrade(portfolio)) {
          result = securities.filter((s) =>
            canPortfolioTradeSecurity(portfolio, s, groupPrefix)
          );
        } else {
          result = securities.filter((s) =>
            contactData?.portfolios?.some(
              (p) =>
                canPfTrade(p) && canPortfolioTradeSecurity(p, s, groupPrefix)
            )
          );
        }
      } else {
        result = undefined;
      }
      setLoading(false);
      return result;
    } catch (e) {
      console.error(e);
      setLoading(false);
      return undefined;
    }
  }, [securities, portfolio, canPfTrade, groupPrefix, contactData?.portfolios]);

  return {
    filterOptions,
    filters,
    setFilters,
    loading: loadingContactData || loading || loadingSecurities,
    error: securitiesError || contactError,
    data: tradable,
  };
};

export const useGetLinkedSecurities = (portfolioId?: number) => {
  const { selectedContactId } = useGetContractIdData();
  const { data: contactData } = useGetContactInfo(false, selectedContactId);
  const { access } = useKeycloak();
  const groupPrefix = access.advisor
    ? CLIENT_PORTAL_ADVISOR_SECURITY_GROUP_PREFIX
    : CLIENT_PORTAL_SECURITY_GROUP_PREFIX;
  const portfolioToTradableSecuritiesMap = getPortfolioToTradableSecuritiesMap(
    contactData?.portfolios,
    groupPrefix
  );
  const securityIdsDistinct = useMemo(() => {
    if (portfolioId)
      return portfolioToTradableSecuritiesMap.get(portfolioId) || [];
    return Array.from(
      new Set(Array.from(portfolioToTradableSecuritiesMap.values()).flat())
    );
  }, [portfolioToTradableSecuritiesMap, portfolioId]);

  return securityIdsDistinct;
};

/**
 * Creates a map of portfolios and their tradable securities
 * based on their linked security groups starting with CP_.
 * @param portfolios
 * @returns a map [portfolioId: [securityId, securityId, ...]]
 */
export const getPortfolioToTradableSecuritiesMap = (
  portfolios: Portfolio[] | undefined,
  groupPrefix: string
) => {
  if (!portfolios) return new Map<Portfolio["id"], number[]>();
  const result = new Map<Portfolio["id"], number[]>();
  portfolios.forEach((portfolio) => {
    const tradableSecurities = portfolio.securityGroups
      .filter((sg) => sg.code.startsWith(groupPrefix))
      .map((sg) => sg.securities)
      .flat();
    result.set(
      portfolio.id,
      tradableSecurities.map((s) => s.id)
    );
  });
  return result;
};

type AnalyticsSecurity = {
  id: number;
  tagsAsList: string[];
};

export const useCanTradeSecurities = (
  securities: AnalyticsSecurity[],
  portfolioId?: number
) => {
  const linkedSecurities = useGetLinkedSecurities(portfolioId);
  const { selectedContactId } = useGetContractIdData();
  const { data: contactData } = useGetContactInfo(false, selectedContactId);
  const portfolio = portfolioId
    ? contactData?.portfolios.find((p) => p.id === portfolioId)
    : undefined;

  const { canPf: canPfTrade } = useFeature(
    PortfolioGroups.TRADE,
    RepresentativeTag.TRADE,
    PermissionMode.SELECTED_ANY
  );

  const isPortfolioTradable = useMemo(() => {
    return portfolio ? canPfTrade(portfolio) : false;
  }, [canPfTrade, portfolio]);
  const tradableHoldings = useMemo(() => {
    if (portfolio && !isPortfolioTradable) {
      return [];
    }
    return (
      securities.reduce((prev, curr) => {
        if (isSecurityTradable(curr.tagsAsList)) {
          return [...prev, curr];
        }
        return prev;
      }, [] as AnalyticsSecurity[]) || []
    );
  }, [securities, portfolio, isPortfolioTradable]);

  const switchableHoldings = useMemo(() => {
    return tradableHoldings?.filter((s) => isSecuritySwitchable(s.tagsAsList));
  }, [tradableHoldings]);

  const canTradeAnyHolding = useMemo(() => {
    if (!linkedSecurities?.length && tradableHoldings.length) return true;
    return linkedSecurities?.some((sId) => {
      return tradableHoldings?.some((h) => h.id === sId);
    });
  }, [linkedSecurities, tradableHoldings]);

  const canSwitchAnyHolding = useMemo(() => {
    if (!linkedSecurities?.length && switchableHoldings.length) return true;
    return linkedSecurities?.some((sId) => {
      return switchableHoldings?.some((h) => h.id === sId);
    });
  }, [linkedSecurities, switchableHoldings]);

  return { canSwitchAnyHolding, canTradeAnyHolding };
};
