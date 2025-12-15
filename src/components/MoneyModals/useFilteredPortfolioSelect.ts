import { useState } from "react";
import type { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { usePortfolioSelect } from "hooks/usePortfolioSelect";
import { filterPortfolioOptionsByFunction } from "utils/options";

export const useFilteredPortfolioSelect = (
  filterFunction: (option: PortfolioOption) => boolean,
  preselectedPortfolioId?: number
) => {
  const { portfolioOptions, selectedPortfolioId } = usePortfolioSelect();
  const filteredPortfolioOptions = filterPortfolioOptionsByFunction(
    portfolioOptions,
    filterFunction
  );
  const [portfolioId, setPortfolioId] = useState(() => {
    // First priority: preselected portfolio (from tax allowance top-up)
    if (
      preselectedPortfolioId &&
      filteredPortfolioOptions.some(
        (option) => option.id === preselectedPortfolioId
      )
    ) {
      return preselectedPortfolioId;
    }
    // Second priority: currently selected portfolio
    if (
      filteredPortfolioOptions.some(
        (option) => option.id === selectedPortfolioId
      )
    ) {
      return selectedPortfolioId;
    }
    // Fallback: first available portfolio
    return filteredPortfolioOptions[0]?.id;
  });

  const result = {
    portfolioId,
    setPortfolioId,
    portfolioOptions: filteredPortfolioOptions,
  };

  return result;
};
