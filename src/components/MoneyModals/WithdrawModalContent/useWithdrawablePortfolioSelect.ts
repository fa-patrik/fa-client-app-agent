import { isPortfolioOptionWithdrawable } from "services/permissions/money";
import { useFilteredPortfolioSelect } from "../useFilteredPortfolioSelect";

export const useWithdrawablePortfolioSelect = () => {
  return useFilteredPortfolioSelect(isPortfolioOptionWithdrawable);
};
