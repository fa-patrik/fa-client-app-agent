import { isPortfolioOptionTradable } from "services/permissions/trade";
import { useFilteredPortfolioSelect } from "./useFilteredPortfolioSelect";

export const useTradablePortfolioSelect = () => {
  const tradablePortfolioOptions = useFilteredPortfolioSelect(
    isPortfolioOptionTradable
  );
  return tradablePortfolioOptions;
};
