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
import { useGetSecuritiesPermissionDetails } from "./useGetSecuritiesPermissionDetails";
import { useGetSecurityPermissionDetails } from "./useGetSecurityPermissionDetails";

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

/**
 * Checks whether the security is tradable by either the contact or (if provided) the portfolio.
 * Queries FA Back for details.
 * Takes into consideration portfolio groups and security tags.
 * @param securityId id of the security
 * @param portfolioId portfolio to check (contact if omitted)
 * @returns true if the securitiy can be traded, else false
 */
export const useCanTradeSecurity = (
  securityId: number,
  portfolioId?: number
) => {
  const [loading, setLoading] = useState(false);
  const { selectedContactId } = useGetContractIdData();
  const {
    data: contactData,
    loading: loadingContactData,
    error: contactError,
  } = useGetContactInfo(false, selectedContactId);
  const portfolio = portfolioId
    ? contactData?.portfolios.find((p) => p.id === portfolioId)
    : undefined;
  const {
    data: securitiesData,
    loading: loadingSecurity,
    error: securityError,
  } = useGetSecurityPermissionDetails(securityId);
  const canTradeSecurity = !!useMemo(() => {
    setLoading(true);
    try {
      /* const canTrade = securitiesData
        ? portfolio
          ? canPortfolioTradeSecurity(portfolio, securitiesData)
          : contactData?.portfolios?.some((p) =>
              canPortfolioTradeSecurity(p, securitiesData)
            )
        : false; */
      const canTrade =
        securitiesData && portfolio
          ? canPortfolioTradeSecurity(portfolio, securitiesData)
          : false;
      setLoading(false);
      return canTrade;
    } catch (e) {
      console.error(e);
      setLoading(false);
      return false;
    }
  }, [/* contactData?.portfolios, */ portfolio, securitiesData]);

  const error = contactError || securityError;

  return {
    canTradeSecurity,
    loading: loadingContactData || loadingSecurity || loading,
    error,
  };
};

/**
 * Checks whether any security in the list is tradable by either the contact or (if provided) the portfolio.
 * Queries FA Back for details.
 * Takes into consideration portfolio groups and security tags.
 * @param securityIds list of security ids
 * @param portfolioId portfolio to check (contact if omitted)
 * @returns true if any of the securities can be traded, else false
 */
export const useCanTradeSecurities = (
  securityIds: number[],
  portfolioId?: number
) => {
  const [loading, setLoading] = useState(false);
  const { selectedContactId } = useGetContractIdData();
  const {
    data: contactData,
    loading: loadingContactData,
    error: contactError,
  } = useGetContactInfo(false, selectedContactId);
  const portfolio = portfolioId
    ? contactData?.portfolios?.find((p) => p.id === portfolioId)
    : undefined;

  const {
    loading: loadingSecurityPermissions,
    data: securitiesData,
    error: securitiesPermissionError,
  } = useGetSecuritiesPermissionDetails(securityIds);

  const canTradeSecurity = !!useMemo(() => {
    setLoading(true);
    try {
      /*  const canTrade = securitiesData
        ? portfolio
          ? securitiesData.some((s) => canPortfolioTradeSecurity(portfolio, s))
          : contactData?.portfolios?.some((p) =>
              securitiesData.some((s) => canPortfolioTradeSecurity(p, s))
            )
        : false; */
      const canTrade =
        securitiesData && portfolio
          ? securitiesData.some((s) => canPortfolioTradeSecurity(portfolio, s))
          : false;
      setLoading(false);
      return canTrade;
    } catch (e) {
      console.error(e);
      setLoading(false);
      return false;
    }
  }, [/* contactData?.portfolios,  */ portfolio, securitiesData]);

  const canSwitchSecurity = !!useMemo(() => {
    return securitiesData?.some((s) => isSecuritySwitchable(s.tagsAsSet));
  }, [securitiesData]);

  const error = contactError || securitiesPermissionError;

  return {
    canTradeSecurity,
    canSwitchSecurity,
    canSellSecurity: false,
    loading: loadingContactData || loadingSecurityPermissions || loading,
    error,
  };
};
