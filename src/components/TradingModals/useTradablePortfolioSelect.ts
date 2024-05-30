import { useCallback } from "react";
import { SecurityGroup } from "api/types";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";

import { useKeycloak } from "providers/KeycloakProvider";
import {
  CLIENT_PORTAL_ADVISOR_SECURITY_GROUP_PREFIX,
  CLIENT_PORTAL_SECURITY_GROUP_PREFIX,
  canPortfolioOptionTrade,
  canPortfolioOptionTradeSecurity,
} from "services/permissions/trading";
import { useFilteredPortfolioSelect } from "./useFilteredPortfolioSelect";

export const useTradablePortfolioSelect = (
  securityGroups?: SecurityGroup[]
) => {
  const { access } = useKeycloak();
  const groupPrefix = access.advisor
    ? CLIENT_PORTAL_ADVISOR_SECURITY_GROUP_PREFIX
    : CLIENT_PORTAL_SECURITY_GROUP_PREFIX;
  //if securityGroups is provided, then check
  //1) portfolio is tradable
  //2) portfolio has the linked the security groups.
  const canTradeSecurityGroups = useCallback(
    (portfolioOption: PortfolioOption) => {
      return (
        !!securityGroups &&
        canPortfolioOptionTradeSecurity(
          portfolioOption,
          securityGroups,
          groupPrefix
        )
      );
    },
    [securityGroups, groupPrefix]
  );

  const tradablePortfolioOptions = useFilteredPortfolioSelect(
    securityGroups ? canTradeSecurityGroups : canPortfolioOptionTrade
  );
  return tradablePortfolioOptions;
};
