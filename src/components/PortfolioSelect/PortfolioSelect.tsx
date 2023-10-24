import { Portfolio } from "api/initial/useGetContactInfo";
import { ComboBox } from "../ComboBox/ComboBox";

export interface PortfolioOption {
  id: number;
  urlPrefix: string;
  label: string;
  subOptions?: PortfolioOption[];
  details: Portfolio | undefined;
  error?: string;
}

interface PortfolioSelectProps {
  id?: string;
  portfolioOptions: PortfolioOption[];
  portfolioId?: number;
  onChange: (option: PortfolioOption) => void;
  label?: string;
  error?: string;
}

export const PortfolioSelect = ({
  id,
  portfolioOptions,
  portfolioId,
  onChange,
  label,
  error,
}: PortfolioSelectProps) => {
  const currentPortfolioOption = getCurrentPortfolioOption(
    portfolioOptions,
    portfolioId
  );
  return (
    <ComboBox
      id={id}
      value={currentPortfolioOption}
      onChange={onChange}
      options={portfolioOptions}
      label={label}
      error={error}
    />
  );
};

/**
 * Returns the portfolio option with the given id
 * Recursively checks also suboptions
 * @param {PortfolioOption[]} portfolioOptions - An array of portfolio options to search through.
 * @param {string|undefined} portfolioId - id to match against.
 * @returns {PortfolioOption|undefined} The portfolio option with the given id or undefined if not found.
 */
const getCurrentPortfolioOption = (
  portfolioOptions: PortfolioOption[],
  portfolioId: number | undefined
): PortfolioOption | undefined => {
  for (const option of portfolioOptions) {
    if (option.id === portfolioId) return option;
    if (option.subOptions?.length) {
      const matchingSubOption = getCurrentPortfolioOption(
        option.subOptions,
        portfolioId
      );
      if (matchingSubOption) return matchingSubOption;
    }
  }
  return undefined;
};
