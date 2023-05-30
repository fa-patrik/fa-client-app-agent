import { isPortfolioOptionDepositable } from "services/permissions/money";
import { useFilteredPortfolioSelect } from "../useFilteredPortfolioSelect";

export const useDepositablePortfolioSelect = () => {
  return useFilteredPortfolioSelect(isPortfolioOptionDepositable);
};
