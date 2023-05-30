import { useState } from "react";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { usePortfolioSelect } from "hooks/usePortfolioSelect";
import { filterPortfolioOptionsByFunction } from "utils/filtering";

export const useFilteredPortfolioSelect = (
  filterFunction: (PortfolioOption: PortfolioOption) => boolean
) => {
  const { portfolioOptions, selectedPortfolioId } = usePortfolioSelect();
  const filteredPortfolioOptions = filterPortfolioOptionsByFunction(
    portfolioOptions,
    filterFunction
  );

  const [portfolioId, setPortfolioId] = useState(() => {
    if (
      filteredPortfolioOptions.some(
        (option) => option.id === selectedPortfolioId
      )
    ) {
      return selectedPortfolioId;
    }
    return filteredPortfolioOptions[0]?.id;
  });

  const result = {
    portfolioId,
    setPortfolioId,
    portfolioOptions: filteredPortfolioOptions,
  };

  return result;
};
