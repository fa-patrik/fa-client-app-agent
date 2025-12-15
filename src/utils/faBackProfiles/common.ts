import type { Portfolio } from "api/common/useGetContactInfo";
import type { Attribute } from "api/common/useGetPortfoliosWithProfileAndFigures";
import type { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";

/**
 * Profile values can be stored as strings
 * even though they are numbers. This function
 * will check the type of the value and convert it
 * to number if it is a string.
 */
export const getDefaultValueAsNumber = (
  value: Attribute["defaultValue"] | undefined
) => {
  if (!value) return;
  if (typeof value === "number") return value;
  if (value instanceof Date || typeof value === "boolean") return;
  if (typeof value === "string" && !isNaN(Number(value))) {
    return Number(value);
  }
};

export const getNumberOfOptions = (
  portfolioOptions: PortfolioOption[] | undefined
) => {
  if (!portfolioOptions?.length) return 0;
  return portfolioOptions.reduce((prev, currTradableOption) => {
    prev++;
    const nrOfSubPortfolioOptions = getNumberOfOptions(
      currTradableOption.subOptions
    );
    prev += nrOfSubPortfolioOptions;
    return prev;
  }, 0);
};

export const getNumberOfPortfolios = (portfolios: Portfolio[] | undefined) => {
  if (!portfolios?.length) return 0;
  return portfolios.reduce((prev, currPortfolio) => {
    prev++;
    const nrOfSubPortfolios = getNumberOfPortfolios(currPortfolio.portfolios);
    prev += nrOfSubPortfolios;
    return prev;
  }, 0);
};
