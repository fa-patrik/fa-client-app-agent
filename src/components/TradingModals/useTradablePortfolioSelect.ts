import { useCallback } from "react";
import { SecurityGroup } from "api/types";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";

import {
  canPortfolioOptionTrade,
  canPortfolioOptionTradeSecurity,
} from "services/permissions/trading";
import { useFilteredPortfolioSelect } from "./useFilteredPortfolioSelect";

export const useTradablePortfolioSelect = (
  securityGroups?: SecurityGroup[]
) => {
  //if securityGroups is provided, then check
  //1) portfolio is tradable
  //2) portfolio has the linked the security groups.
  const canTradeSecurityGroups = useCallback(
    (portfolioOption: PortfolioOption) => {
      return (
        !!securityGroups &&
        canPortfolioOptionTradeSecurity(portfolioOption, securityGroups)
      );
    },
    [securityGroups]
  );

  const tradablePortfolioOptions = useFilteredPortfolioSelect(
    securityGroups ? canTradeSecurityGroups : canPortfolioOptionTrade
  );
  return tradablePortfolioOptions;
};
