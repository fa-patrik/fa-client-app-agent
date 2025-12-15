import { useState } from "react";
import type { Option } from "components/ComboBox/ComboBox";
import type { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { useGetPortfolioOptions } from "hooks/useGetPortfolioOptions";
import { useParams } from "react-router-dom";
import { filterPortfolioOptionsByFunction } from "utils/options";

/**
 * Helper function to check whether portfolioId exists in a list of options.
 * Recursively checks all suboptions as well.
 * @param options Options in which to check whether portfolioId exists.
 * @param portfolioId portfolio id to check.
 * @returns true if portfolioId exists in options, otherwise false.
 */
export const isPortfolioIdInOptions = (
  options: Option[] | undefined,
  portfolioId: number | undefined
) => {
  if (!portfolioId) return false;
  if (!options?.length) return false;
  for (const option of options) {
    if (option.id === portfolioId) return true;
    const isInSubOptions = isPortfolioIdInOptions(
      option.subOptions,
      portfolioId
    );
    if (isInSubOptions) return true;
  }
  return false;
};

/**
 * Counts the total nr of portfolio options
 * Includes sub options as well.
 * @param portfolioOptions
 * @returns Total nr of portfolio options (including sub options)
 */
const getNrOfPortfolioOptions = (
  portfolioOptions: PortfolioOption[] | undefined
) => {
  if (!portfolioOptions?.length) return 0;
  return portfolioOptions.reduce((prev, currTradableOption) => {
    prev++;
    const nrOfSubPortfolioOptions = getNrOfPortfolioOptions(
      currTradableOption.subOptions
    );
    prev += nrOfSubPortfolioOptions;
    return prev;
  }, 0);
};

export const useFilteredPortfolioSelect = (
  filterFunction: (option: PortfolioOption) => boolean
) => {
  const { portfolioId: portfolioIdUrl } = useParams();
  const portfolioOptions = useGetPortfolioOptions(false);
  const filteredOptions = filterPortfolioOptionsByFunction(
    portfolioOptions,
    filterFunction
  );
  const portfolioId = portfolioIdUrl ? parseInt(portfolioIdUrl, 10) : undefined;

  // Check if the portfolioId from useParams exists in filtered options
  const portfolioIdIsInFiltered = isPortfolioIdInOptions(
    filteredOptions,
    portfolioId
  );

  const [filteredPortfolioId, setFilteredPortfolioId] = useState(() => {
    if (portfolioId && portfolioIdIsInFiltered) {
      // If the main portfolio selector has chosen an elegible portfolio
      return portfolioId;
    } else if (getNrOfPortfolioOptions(filteredOptions) === 1) {
      // If there is only one elegible portfolio
      return filteredOptions[0].id;
    } else {
      // If there are multiple elegible portfolios, let the user select a portfolio
      return undefined;
    }
  });

  const handleSetPortfolioId = (id: number) => {
    setFilteredPortfolioId(id);
  };

  return {
    setPortfolioId: handleSetPortfolioId,
    portfolioId: filteredPortfolioId,
    portfolioOptions: filteredOptions,
  };
};
