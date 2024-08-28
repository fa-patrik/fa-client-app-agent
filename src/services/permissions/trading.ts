import { useMemo, useState } from "react";
import {
  Portfolio,
  PortfolioGroups,
  RepresentativeTag,
  useGetContactInfo,
} from "api/common/useGetContactInfo";
import { useGetTradebleSecurities } from "api/trading/useGetTradebleSecurities";
import { SecurityGroup } from "api/types";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { isPortfolioEligible, isPortfolioOptionEligible } from "./common";

export const CLIENT_PORTAL_SECURITY_GROUP_PREFIX = "CP_";
export const CLIENT_PORTAL_ADVISOR_SECURITY_GROUP_PREFIX = "ADV_";
export const tradableTag = "Tradeable";
export const switchableTag = "Switchable";

//Monthly investments
export const canPortfolioMonthlyInvest = (
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  portfolio: Portfolio,
  linkedContact: string | undefined
) => {
  return isPortfolioEligible(
    contactRepresentativeTags,
    portfolio,
    linkedContact,
    PortfolioGroups.MONTHLY_INVESTMENTS,
    RepresentativeTag.MONTHLY_INVESTMENTS
  );
};

export const canPortfolioOptionMonthlyInvest = (
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  portfolioOption: PortfolioOption,
  linkedContact: string | undefined
) => {
  return isPortfolioOptionEligible(
    contactRepresentativeTags,
    portfolioOption,
    linkedContact,
    PortfolioGroups.MONTHLY_INVESTMENTS,
    RepresentativeTag.MONTHLY_INVESTMENTS
  );
};

//Monthly savings
export const canPortfolioMonthlySave = (
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  portfolio: Portfolio,
  linkedContact: string | undefined
) => {
  return isPortfolioEligible(
    contactRepresentativeTags,
    portfolio,
    linkedContact,
    PortfolioGroups.MONTHLY_SAVINGS,
    RepresentativeTag.MONTHLY_SAVINGS
  );
};

export const canPortfolioOptionMonthlySave = (
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  portfolioOption: PortfolioOption,
  linkedContact: string | undefined
) => {
  return isPortfolioOptionEligible(
    contactRepresentativeTags,
    portfolioOption,
    linkedContact,
    PortfolioGroups.MONTHLY_SAVINGS,
    RepresentativeTag.MONTHLY_SAVINGS
  );
};

//Does the portfolio have the ability to trade
export const canPortfolioTrade = (
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  portfolio: Portfolio,
  linkedContact: string | undefined
) => {
  return isPortfolioEligible(
    contactRepresentativeTags,
    portfolio,
    linkedContact,
    PortfolioGroups.TRADE,
    RepresentativeTag.TRADE
  );
};

export const canPortfolioOptionTrade = (
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  portfolioOption: PortfolioOption,
  linkedContact: string | undefined
) => {
  return isPortfolioOptionEligible(
    contactRepresentativeTags,
    portfolioOption,
    linkedContact,
    PortfolioGroups.TRADE,
    RepresentativeTag.TRADE
  );
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
  securityGroups: SecurityGroup[],
  groupPrefix: string
) => {
  try {
    return portfolio?.securityGroups?.some((sg) => {
      if (sg.code?.startsWith(groupPrefix)) {
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
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  linkedContact: string | undefined,
  portfolioOption: PortfolioOption,
  securityGroups: SecurityGroup[],
  groupPrefix: string
) => {
  try {
    if (!portfolioOption.details) return false; //no data available
    return canPortfolioTradeSecurityGroups(
      contactRepresentativeTags,
      linkedContact,
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
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  linkedContact: string | undefined,
  portfolio: Portfolio,
  securityGroups: SecurityGroup[],
  groupPrefix: string
) => {
  try {
    if (
      isPortfolioEligible(
        contactRepresentativeTags,
        portfolio,
        linkedContact,
        PortfolioGroups.TRADE,
        RepresentativeTag.TRADE
      )
    ) {
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
  contactRepresentativeTags: Record<string, RepresentativeTag> | undefined,
  linkedContact: string | undefined,
  portfolio: Portfolio,
  security: Security,
  groupPrefix: string
) => {
  try {
    if (
      isPortfolioEligible(
        contactRepresentativeTags,
        portfolio,
        linkedContact,
        PortfolioGroups.TRADE,
        RepresentativeTag.TRADE
      ) &&
      isSecurityTradable(security.tagsAsSet)
    ) {
      //portfolio is allowed to be traded in by the user

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
  const { access, linkedContact } = useKeycloak();
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
  const contactRepresentativeTags = contactData?.representativeTags;
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
          ? securities.filter((s) =>
              canPortfolioTradeSecurity(
                contactRepresentativeTags,
                linkedContact,
                portfolio,
                s,
                groupPrefix
              )
            )
          : securities.filter((s) =>
              contactData?.portfolios?.some((p) =>
                canPortfolioTradeSecurity(
                  contactRepresentativeTags,
                  linkedContact,
                  p,
                  s,
                  groupPrefix
                )
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
  }, [
    securities,
    portfolio,
    contactRepresentativeTags,
    linkedContact,
    groupPrefix,
    contactData?.portfolios,
  ]);
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
  const { linkedContact } = useKeycloak();
  const linkedSecurities = useGetLinkedSecurities(portfolioId);
  const { selectedContactId } = useGetContractIdData();
  const { data: contactData } = useGetContactInfo(false, selectedContactId);
  const portfolio = portfolioId
    ? contactData?.portfolios.find((p) => p.id === portfolioId)
    : undefined;
  const contactRepresentativeTags = contactData?.representativeTags;
  const isPortfolioTradable = useMemo(() => {
    return portfolio
      ? canPortfolioTrade(contactRepresentativeTags, portfolio, linkedContact)
      : false;
  }, [portfolio, contactRepresentativeTags, linkedContact]);
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
