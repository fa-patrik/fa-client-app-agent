import { useState } from "react";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { usePortfolioSelect } from "hooks/usePortfolioSelect";
import { useKeycloak } from "providers/KeycloakProvider";
import { filterPortfolioOptionsByFunction } from "utils/options";

export const useFilteredPortfolioSelect = (
  filterFunction: (
    PortfolioOption: PortfolioOption,
    linkedContact: string | undefined
  ) => boolean
) => {
  const { linkedContact } = useKeycloak();
  const { portfolioOptions, selectedPortfolioId } = usePortfolioSelect();
  const filteredPortfolioOptions = filterPortfolioOptionsByFunction(
    portfolioOptions,
    linkedContact,
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
