import { Option } from "components/ComboBox/ComboBox";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";

/**
 * Helper function to check whether an option exists in a list of options.
 * Recursively checks all suboptions as well. Uses the option id to match.
 * @param options Options in which to check whether optionToCheck exists.
 * @param optionToCheck Option to check.
 * @returns true if optionToCheck exists in options, otherwise false.
 */
export const isInOptions = (
  options: Option[] | undefined,
  optionToCheck: Option
) => {
  if (!options?.length) return false;
  for (const option of options) {
    if (option.id === optionToCheck.id) return true;
    const isInSubOptions = isInOptions(option.subOptions, optionToCheck);
    if (isInSubOptions) return true;
  }
  return false;
};

/**
 * Finds all options with a label matching the query string.
 * Also recursively searches all suboptions.
 * @param options Options to filter.
 * @param query A query string to match against option labels.
 * @returns Unique options with a label matching the query string.
 */
export const filterOptionsByQuery = (
  options: Option[] | undefined,
  query: string
) => {
  if (!query) return options || [];
  if (!options?.length) return [];
  return options.reduce((prev, currOption) => {
    if (
      currOption.label.toLowerCase().includes(query.toLowerCase()) &&
      !isInOptions(prev, currOption)
    ) {
      prev.push(currOption);
    }
    const matchingSubOptions = filterOptionsByQuery(
      currOption.subOptions,
      query
    );
    matchingSubOptions?.forEach((subOption) => {
      if (!isInOptions(prev, subOption)) prev.push(subOption);
    });
    return prev;
  }, [] as Option[]);
};

/**
 * Finds all PortfoliOptions, including sub options (recursively)
 * that return truthy with the filter function.
 * @param portfolioOption List of PortfolioOptions.
 * @param filterFunction a function that returns true or false when consuming a PortfolioOption.
 * @returns filtered options.
 */
export const filterPortfolioOptionsByFunction = (
  portfolioOptions: PortfolioOption[] | undefined,
  linkedContact: string | undefined,
  filterFunction: (
    portfolioOption: PortfolioOption,
    linkedContact: string | undefined
  ) => boolean
) => {
  if (!portfolioOptions?.length) return [];
  return portfolioOptions.reduce((prev, currOption) => {
    if (
      filterFunction(currOption, linkedContact) &&
      !isInOptions(prev, currOption)
    ) {
      prev.push({
        ...currOption,
        subOptions: filterPortfolioOptionsByFunction(
          currOption.subOptions,
          linkedContact,
          filterFunction
        ),
      });
    }
    const matchingSubOptions = filterPortfolioOptionsByFunction(
      currOption.subOptions,
      linkedContact,
      filterFunction
    );
    matchingSubOptions?.forEach((subOption) => {
      if (!isInOptions(prev, subOption)) prev.push(subOption);
    });
    return prev;
  }, [] as PortfolioOption[]);
};

/**
 * Finds all options, including sub options (recursively)
 * that return truthy with the filter function.
 * @param option List of options.
 * @param filterFunction a function that returns true or false when consuming an option.
 * @returns filtered options.
 */
export const filterOptionsByFunction = (
  option: Option[] | undefined,
  filterFunction: (option: Option) => boolean
) => {
  if (!option?.length) return [];
  return option.reduce((prev, currOption) => {
    if (filterFunction(currOption)) {
      prev.push({
        ...currOption,
        subOptions: filterOptionsByFunction(
          currOption.subOptions,
          filterFunction
        ),
      });
    } else {
      prev.push(
        ...filterOptionsByFunction(currOption.subOptions, filterFunction)
      );
    }
    return prev;
  }, [] as Option[]);
};

/**
 * Finds the PortfolioOption (recursively)
 * matching the id.
 * @param options List of options.
 * @param id id of option.
 * @returns option or undefined.
 */
export const findPortfolioOptionById = (
  options: PortfolioOption[] | undefined,
  id: number
): PortfolioOption | undefined => {
  if (!options) return;

  for (const option of options) {
    if (option.id === id) {
      return option;
    }

    const foundSubOption = findPortfolioOptionById(option.subOptions, id);

    if (foundSubOption) {
      return foundSubOption;
    }
  }
};

export const getHeightClass = (screenHeight: number) => {
  if (screenHeight <= 400) {
    // xs
    return "max-h-24";
  } else if (screenHeight <= 768) {
    // sm
    return "max-h-40";
  } else if (screenHeight <= 1024) {
    // md
    return "max-h-52";
  } else {
    // lg
    return "max-h-64";
  }
};
