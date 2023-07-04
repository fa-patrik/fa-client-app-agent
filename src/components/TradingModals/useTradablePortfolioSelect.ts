import { canPortfolioOptionTrade } from "services/permissions/usePermission";
import { useFilteredPortfolioSelect } from "./useFilteredPortfolioSelect";

export const useTradablePortfolioSelect = () => {
  const tradablePortfolioOptions = useFilteredPortfolioSelect(
    canPortfolioOptionTrade
  );
  return tradablePortfolioOptions;
};
