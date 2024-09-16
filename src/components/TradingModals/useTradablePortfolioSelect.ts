import { useCallback } from "react";
import {
  PortfolioGroups,
  RepresentativeTag,
} from "api/common/useGetContactInfo";
import { SecurityGroup } from "api/types";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { useKeycloak } from "providers/KeycloakProvider";
import {
  CLIENT_PORTAL_ADVISOR_SECURITY_GROUP_PREFIX,
  CLIENT_PORTAL_SECURITY_GROUP_PREFIX,
  canPortfolioOptionTradeSecurity,
} from "services/permissions/trading";
import { PermissionMode, useFeature } from "services/permissions/usePermission";
import { useFilteredPortfolioSelect } from "./useFilteredPortfolioSelect";

export const useTradablePortfolioSelect = (
  securityGroups?: SecurityGroup[]
) => {
  const { access } = useKeycloak();
  const { canPfOption: canPfOptionTrade } = useFeature(
    PortfolioGroups.TRADE,
    RepresentativeTag.TRADE,
    PermissionMode.SELECTED_ANY
  );
  const groupPrefix = access.advisor
    ? CLIENT_PORTAL_ADVISOR_SECURITY_GROUP_PREFIX
    : CLIENT_PORTAL_SECURITY_GROUP_PREFIX;

  const canTradeSecurityGroups = useCallback(
    (portfolioOption: PortfolioOption) => {
      return (
        //portfolio can trade
        canPfOptionTrade(portfolioOption) &&
        //check if security group is linked to the portfolio
        canPortfolioOptionTradeSecurity(
          portfolioOption,
          securityGroups,
          groupPrefix
        )
      );
    },
    [securityGroups, groupPrefix, canPfOptionTrade]
  );

  const tradablePortfolioOptions = useFilteredPortfolioSelect(
    securityGroups ? canTradeSecurityGroups : canPfOptionTrade
  );
  return tradablePortfolioOptions;
};
