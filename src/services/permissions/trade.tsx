import { Portfolio, useGetContactInfo } from "api/initial/useGetContactInfo";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useParams } from "react-router-dom";

export enum canTradeMode {
  ANY,
  SELECTED,
  SELECTED_ANY,
}

export const tradableTag = "Tradeable";
export const TradePermissionGroup = "CP_TRADING" as const;

export const isPortfolioTradable = (portfolio: Portfolio) =>
  portfolio.portfolioGroups.some(
    (group) => group.code === TradePermissionGroup
  );

export const isPortfolioOptionTradable = (portfolioOption: PortfolioOption) => {
  const isTradable =
    portfolioOption?.details && isPortfolioTradable(portfolioOption?.details);
  if (isTradable) return true;
  return false;
};

/*
* Checks if user or portfolio is eligible to trade
* @param mode: mode to apply when checking if eligible to trade
* SELECTED - check only if the currently selected portfolio can trade
* ANY - check if any of the user's portfolios can trade
* SELECTED_ANY - use SELECTED_ONLY if there is a selected portfolio, else do ANY
* @return boolean - whether trading is allowed
*/
export const useCanTrade = (mode = canTradeMode.SELECTED) => {
  const { portfolioId } = useParams();
  const { selectedContactId } = useGetContractIdData();
  const { data: { portfolios } = { portfolios: [] } } = useGetContactInfo(
    false,
    selectedContactId
  );

  const isAnyPortfolioTradable = portfolios.some(isPortfolioTradable);
  const selectedPortfolio = portfolios.filter(
    (portfolio) =>
      portfolioId !== undefined && portfolio.id === parseInt(portfolioId, 10)
  );
  const isSelectedPortfolioTradable =
    selectedPortfolio.some(isPortfolioTradable);

  switch (mode) {
    case canTradeMode.ANY:
      return isAnyPortfolioTradable;
    case canTradeMode.SELECTED:
      return isSelectedPortfolioTradable;
    case canTradeMode.SELECTED_ANY:
      if (portfolioId !== undefined) return isSelectedPortfolioTradable;
      return isAnyPortfolioTradable;
    default:
      return false;
  }
};