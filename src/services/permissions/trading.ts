import { useMemo, useState } from "react";
import {
  Portfolio,
  PortfolioGroups,
  useGetContactInfo,
} from "api/common/useGetContactInfo";
import { useGetTradebleSecurities } from "api/trading/useGetTradebleSecurities";
import { SecurityGroup } from "api/types";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { isPortfolioInGroup, isPortfolioOptionInGroup } from "./common";

export const CLIENT_PORTAL_SECURITY_GROUP_PREFIX = "CP_";
export const tradableTag = "Tradeable";
export const switchableTag = "Switchable";

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

//Monthly savings
export const canPortfolioMonthlySave = (portfolio: Portfolio) => {
  return isPortfolioInGroup(portfolio, PortfolioGroups.MONTHLY_SAVINGS);
};

export const canPortfolioOptionMonthlySave = (
  portfolioOption: PortfolioOption
) => {
  return isPortfolioOptionInGroup(
    portfolioOption,
    PortfolioGroups.MONTHLY_SAVINGS
  );
};

//Does the portfolio have the ability to trade
export const canPortfolioTrade = (portfolio: Portfolio) => {
  return isPortfolioInGroup(portfolio, PortfolioGroups.TRADE);
};

export const canPortfolioOptionTrade = (portfolioOption: PortfolioOption) => {
  return isPortfolioOptionInGroup(portfolioOption, PortfolioGroups.TRADE);
};

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
  securityGroups: SecurityGroup[]
) => {
  try {
    return portfolio?.securityGroups?.some((sg) => {
      if (sg.code?.startsWith(CLIENT_PORTAL_SECURITY_GROUP_PREFIX)) {
        return securityGroups.some(
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

export const isPortfolioLinkedToAnySecurityGroup = (portfolio: Portfolio) => {
  try {
    return portfolio?.securityGroups?.some((sg) =>
      sg.code.startsWith(CLIENT_PORTAL_SECURITY_GROUP_PREFIX)
    );
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const canPortfolioOptionTradeSecurity = (
  portfolioOption: PortfolioOption,
  securityGroups: SecurityGroup[]
) => {
  try {
    if (!portfolioOption.details) return false; //no data available
    return canPortfolioTradeSecurityGroups(
      portfolioOption.details,
      securityGroups
    );
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const canPortfolioTradeSecurityGroups = (
  portfolio: Portfolio,
  securityGroups: SecurityGroup[]
) => {
  try {
    if (isPortfolioInGroup(portfolio, PortfolioGroups.TRADE)) {
      if (!isPortfolioLinkedToAnySecurityGroup(portfolio)) {
        //can trade all securities
        return true;
      } else {
        //can trade linked securities
        return isPortfolioLinkedToSecurityGroups(portfolio, securityGroups);
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

export const canPortfolioTradeSecurity = (
  portfolio: Portfolio,
  security: Security
) => {
  try {
    if (
      isPortfolioInGroup(portfolio, PortfolioGroups.TRADE) &&
      isSecurityTradable(security.tagsAsSet)
    ) {
      if (!isPortfolioLinkedToAnySecurityGroup(portfolio)) {
        //can trade all securities
        return true;
      } else {
        //can trade linked securities
        return isPortfolioLinkedToSecurityGroups(portfolio, security.groups);
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
  const [loading, setLoading] = useState(false);
  const { selectedContactId } = useGetContractIdData();
  const {
    data: contactData,
    loading: loadingContactData,
    error: contactError,
  } = useGetContactInfo(false, selectedContactId);

  const {
    filters,
    setFilters,
    filterOptions,
    data: securities,
    loading: loadingSecurities,
    error: securitiesError,
  } = useGetTradebleSecurities(options?.currencyCode, options?.tags);

  const portfolio = portfolioId
    ? contactData?.portfolios.find((p) => p.id === portfolioId)
    : undefined;
  const tradable = useMemo(() => {
    setLoading(true);
    try {
      const result = securities
        ? portfolio
          ? securities.filter((s) => canPortfolioTradeSecurity(portfolio, s))
          : securities.filter((s) =>
              contactData?.portfolios?.some((p) =>
                canPortfolioTradeSecurity(p, s)
              )
            )
        : undefined;
      setLoading(false);
      return result;
    } catch (e) {
      console.error(e);
      setLoading(false);
      return undefined;
    }
  }, [contactData?.portfolios, portfolio, securities]);
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
  const portfolioToTradableSecuritiesMap = getPortfolioToTradableSecuritiesMap(
    contactData?.portfolios
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
  portfolios: Portfolio[] | undefined
) => {
  if (!portfolios) return new Map<Portfolio["id"], number[]>();
  const result = new Map<Portfolio["id"], number[]>();
  portfolios.forEach((portfolio) => {
    const tradableSecurities = portfolio.securityGroups
      .filter((sg) => sg.code.startsWith(CLIENT_PORTAL_SECURITY_GROUP_PREFIX))
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
  const isPortfolioTradable = useMemo(() => {
    return portfolio ? canPortfolioTrade(portfolio) : false;
  }, [portfolio]);
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
